/**
 * Suite de tests automatisés pour valider le chiffrement
 * au repos (AES-256-GCM) et l'intégrité des données et documents.
 */

import { encryptText, decryptText, isEncrypted, encryptBuffer, decryptBuffer } from "./utils/cryptoService";

function runTests() {
  console.log("[TEST] Démarrage des tests du module de chiffrement...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  [SUCCES] ${name}`);
      passed++;
    } else {
      console.error(`  [ECHEC] ${name}`);
      failed++;
    }
  }

  // 1. Chiffrement et déchiffrement d'un numéro de téléphone
  const phone = "06 12 34 56 78";
  const encryptedPhone = encryptText(phone);
  assert(isEncrypted(encryptedPhone), "Le téléphone chiffré possède le préfixe enc:v1");
  assert(encryptedPhone !== phone, "Le téléphone chiffré est différent du texte en clair");
  
  const decryptedPhone = decryptText(encryptedPhone);
  assert(decryptedPhone === phone, "Le déchiffrement restitue exactement le numéro d'origine");

  // 2. Randomisation de l'IV (Deux chiffrements successifs génèrent des IV distincts)
  const encryptedPhone2 = encryptText(phone);
  assert(encryptedPhone !== encryptedPhone2, "Deux chiffrements successifs génèrent des IV différents (sécurité sémantique)");
  assert(decryptText(encryptedPhone2) === phone, "Le second ciphertext se déchiffre également correctement");

  // 3. Rétro-compatibilité avec les données existantes non chiffrées
  const legacyData = "06 99 88 77 66";
  const decryptedLegacy = decryptText(legacyData);
  assert(decryptedLegacy === legacyData, "Une donnée legacy en clair est retournée intacte sans erreur");

  // 4. Test d'intégrité et détection d'altération (Auth Tag AES-GCM)
  const parts = encryptedPhone.split(":");
  const corruptedCipher = parts[4].slice(0, -1) + (parts[4].endsWith("a") ? "b" : "a");
  const corruptedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${corruptedCipher}`;
  const tamperedResult = decryptText(corruptedPayload);
  assert(tamperedResult === corruptedPayload, "Une donnée altérée est rejetée car le tag d'authentification ne correspond pas");

  // 5. Test de chiffrement binaire pour documents (simulation PDF)
  const fakePdfContent = Buffer.from("%PDF-1.4 ... Contenu simulé du CV de Marie Dupont ... %%EOF");
  const { encryptedData, iv, tag } = encryptBuffer(fakePdfContent);
  assert(encryptedData.length > 0, "Le buffer chiffré n'est pas vide");
  assert(encryptedData.toString() !== fakePdfContent.toString(), "Le buffer chiffré est illisible");

  const restoredPdf = decryptBuffer(encryptedData, iv, tag);
  assert(restoredPdf.equals(fakePdfContent), "Le déchiffrement du buffer restitue fidèlement le document binaire");

  // 6. Test du contrôleur de documents (upload chiffré et téléchargement déchiffré)
  const { uploadDocument, downloadDocument } = require("./controllers/document.controller");
  const testDocContent = "CV Professionnel de Test - Coiffeur Visagiste 2026";
  const testBase64 = Buffer.from(testDocContent).toString("base64");
  let createdDocId = "";

  const mockReqUpload: any = {
    body: {
      fileName: "test_cv.pdf",
      fileType: "application/pdf",
      dataBase64: testBase64,
      candidateId: "recTestCandidate99",
    },
  };

  const mockResUpload: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      createdDocId = payload?.document?.docId;
    },
  };

  uploadDocument(mockReqUpload, mockResUpload);
  assert(mockResUpload.statusCode === 201 && Boolean(createdDocId), "L'upload du document génère un docId et renvoie HTTP 201");

  let decryptedStreamOutput: Buffer = Buffer.alloc(0);
  const mockReqDownload: any = { params: { docId: createdDocId } };
  const mockResDownload: any = {
    headers: {} as Record<string, any>,
    setHeader(key: string, val: any) {
      this.headers[key] = val;
    },
    send(buf: Buffer) {
      decryptedStreamOutput = buf;
    },
    status(code: number) {
      return this;
    },
    json() {},
  };

  downloadDocument(mockReqDownload, mockResDownload);
  assert(
    decryptedStreamOutput.toString("utf-8") === testDocContent,
    "Le téléchargement du document déchiffre à la volée le contenu original"
  );
  assert(mockResDownload.headers["Content-Type"] === "application/pdf", "Le Content-Type du document est préservé");

  console.log(`\n[RESULTAT] ${passed} tests passés, ${failed} échec(s).\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

