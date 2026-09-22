// ════════════════════════════════════════════════════════════
// backend/src/controllers/document.controller.ts
// ────────────────────────────────────────────────────────────
// Gestion sécurisée des documents (CV, diplômes, contrats) :
// - Chiffrement au repos obligatoire (AES-256-GCM)
// - Déchiffrement à la volée pour les utilisateurs autorisés
// ════════════════════════════════════════════════════════════

import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { encryptBuffer, decryptBuffer } from "../utils/cryptoService";

// Répertoire de stockage sécurisé des documents chiffrés
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads/encrypted");

// Assure la création du dossier de stockage chiffré
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StoredDocumentMetadata {
  docId: string;
  candidateId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  iv: string;
  tag: string;
  uploadedAt: string;
  isEncrypted: boolean;
}

const META_FILE = path.join(UPLOADS_DIR, "documents-meta.json");

function getMetadataStore(): Record<string, StoredDocumentMetadata> {
  if (fs.existsSync(META_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveMetadataStore(store: Record<string, StoredDocumentMetadata>) {
  fs.writeFileSync(META_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Upload et chiffrement d'un document (CV, diplôme, justificatif)
 * Payload attendu : { fileName, fileType, dataBase64, candidateId }
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, dataBase64, candidateId } = req.body;

    if (!dataBase64 || !fileName) {
      return res.status(400).json({ message: "Données du document manquantes (fileName et dataBase64 requis)." });
    }

    // Extraction du buffer depuis le format base64
    const cleanBase64 = dataBase64.includes(";base64,") ? dataBase64.split(";base64,")[1] : dataBase64;
    const rawBuffer = Buffer.from(cleanBase64, "base64");

    // 🔒 Chiffrement immédiat au repos avec AES-256-GCM
    const { encryptedData, iv, tag } = encryptBuffer(rawBuffer);

    const docId = crypto.randomUUID();
    const encryptedFilePath = path.join(UPLOADS_DIR, `${docId}.enc`);

    // Écriture du fichier chiffré sur disque
    fs.writeFileSync(encryptedFilePath, encryptedData);

    // Enregistrement des métadonnées sécurisées
    const metadata: StoredDocumentMetadata = {
      docId,
      candidateId: candidateId || "anonymous",
      fileName: fileName || "document.pdf",
      fileType: fileType || "application/pdf",
      fileSize: rawBuffer.length,
      iv,
      tag,
      uploadedAt: new Date().toISOString(),
      isEncrypted: true,
    };

    const store = getMetadataStore();
    store[docId] = metadata;
    saveMetadataStore(store);

    console.log(`🔒 [DOCUMENT] Document "${fileName}" chiffré au repos avec succès (ID: ${docId}, taille chiffrée: ${encryptedData.length} octets).`);

    return res.status(201).json({
      message: "Document téléversé et chiffré au repos avec succès.",
      document: {
        docId,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        fileSize: metadata.fileSize,
        uploadedAt: metadata.uploadedAt,
        isEncrypted: true,
      },
    });
  } catch (error: any) {
    console.error("❌ [DOCUMENT] Erreur lors du téléversement/chiffrement :", error);
    return res.status(500).json({ message: error.message || "Erreur interne lors du chiffrement du document." });
  }
};

/**
 * Téléchargement et déchiffrement à la volée d'un document
 */
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    const store = getMetadataStore();
    const meta = store[docId];

    if (!meta) {
      return res.status(404).json({ message: "Document introuvable." });
    }

    const encryptedFilePath = path.join(UPLOADS_DIR, `${docId}.enc`);
    if (!fs.existsSync(encryptedFilePath)) {
      return res.status(404).json({ message: "Fichier chiffré introuvable sur le disque." });
    }

    const encryptedBuffer = fs.readFileSync(encryptedFilePath);

    // 🔓 Déchiffrement et vérification d'intégrité par tag AES-GCM
    const decryptedBuffer = decryptBuffer(encryptedBuffer, meta.iv, meta.tag);

    res.setHeader("Content-Type", meta.fileType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(meta.fileName)}"`);
    res.setHeader("Content-Length", decryptedBuffer.length);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");

    return res.send(decryptedBuffer);
  } catch (error: any) {
    console.error(`❌ [DOCUMENT] Erreur lors du déchiffrement du document ${req.params.docId} :`, error);
    return res.status(500).json({ message: "Erreur lors du déchiffrement du document." });
  }
};

/**
 * Liste des documents chiffrés d'un candidat
 */
export const getCandidateDocuments = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const store = getMetadataStore();

    const docs = Object.values(store)
      .filter((d) => d.candidateId === candidateId)
      .map(({ iv, tag, ...safeMeta }) => safeMeta);

    return res.status(200).json(docs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Erreur récupération documents." });
  }
};
