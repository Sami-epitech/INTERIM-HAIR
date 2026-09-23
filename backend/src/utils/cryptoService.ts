// ════════════════════════════════════════════════════════════
// backend/src/utils/cryptoService.ts
// ────────────────────────────────────────────────────────────
// Module de chiffrement au repos conforme RGPD / ANSSI
// - Algorithme : AES-256-GCM (Chiffrement symétrique authentifié)
// - Vecteur d'initialisation (IV) : 16 octets aléatoires par opération
// - Tag d'authentification : 16 octets garantissant l'intégrité
// - Format sérialisé : enc:v1:<ivHex>:<tagHex>:<cipherHex>
// ════════════════════════════════════════════════════════════

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const PREFIX = "enc:v1";

/**
 * Dérive une clé de 32 octets (256 bits) à partir de la variable d'environnement,
 * ou d'une clé dérivée par SHA-256 en fallback de développement local.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY_HEX;
  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, "hex");
    }
    // Si la clé fournie est une chaîne arbitraire (ex: phrase secrète), on la dérive en 32 octets via SHA-256
    return crypto.createHash("sha256").update(envKey).digest();
  }

  // Clé de développement par défaut (permet le fonctionnement "out-of-the-box" en dev)
  const devSeed = "interim-hair-secret-encryption-key-dev-seed-2026";
  return crypto.createHash("sha256").update(devSeed).digest();
}

/**
 * Chiffre une chaîne de caractères (ex. numéro de téléphone, adresse, IBAN) avec AES-256-GCM.
 * Retourne le texte chiffré au format `enc:v1:<iv>:<tag>:<ciphertext>`.
 */
export function encryptText(plainText: string): string {
  if (!plainText || typeof plainText !== "string") {
    return plainText;
  }

  // Évite le double-chiffrement si la chaîne est déjà chiffrée
  if (isEncrypted(plainText)) {
    return plainText;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${PREFIX}:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Déchiffre une chaîne chiffrée au format `enc:v1:<iv>:<tag>:<ciphertext>`.
 * Si la chaîne est en texte brut (donnée legacy ou non chiffrée), elle est retournée telle quelle.
 */
export function decryptText(cipherText: string): string {
  if (!cipherText || typeof cipherText !== "string") {
    return cipherText;
  }

  if (!isEncrypted(cipherText)) {
    // Rétro-compatibilité avec les données existantes non chiffrées
    return cipherText;
  }

  try {
    const parts = cipherText.split(":");
    if (parts.length !== 5) {
      // Format attendu: ["enc", "v1", ivHex, tagHex, encryptedHex]
      return cipherText;
    }

    const ivHex = parts[2];
    const authTagHex = parts[3];
    const encryptedHex = parts[4];

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.warn("⚠️ [CRYPTO] Échec du déchiffrement (tag invalide ou clé différente), retour de la chaîne brute.");
    return cipherText;
  }
}

/**
 * Vérifie si une chaîne commence par le préfixe de chiffrement
 */
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(`${PREFIX}:`);
}

/**
 * Chiffre un buffer binaire (ex. document PDF, image justificative de CV).
 */
export function encryptBuffer(buffer: Buffer): { encryptedData: Buffer; iv: string; tag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Déchiffre un buffer binaire à partir de son IV et de son Tag d'authentification.
 */
export function decryptBuffer(encryptedBuffer: Buffer, ivHex: string, tagHex: string): Buffer {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}
