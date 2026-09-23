import { encryptText, decryptText, isEncrypted, encryptBuffer, decryptBuffer } from '../src/utils/cryptoService';

describe('TK-006 : Chiffrement des Données Sensibles (AES-256-GCM)', () => {
  const sensitivePhone = '06 12 34 56 78';

  it('devrait chiffrer les données sensibles avec le préfixe enc:v1', () => {
    const encrypted = encryptText(sensitivePhone);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(encrypted).not.toBe(sensitivePhone);
    expect(encrypted.startsWith('enc:v1:')).toBe(true);
  });

  it('devrait déchiffrer fidèlement la donnée d\'origine', () => {
    const encrypted = encryptText(sensitivePhone);
    const decrypted = decryptText(encrypted);
    expect(decrypted).toBe(sensitivePhone);
  });

  it('devrait randomiser l\'IV pour deux chiffrements successifs de la même valeur', () => {
    const enc1 = encryptText(sensitivePhone);
    const enc2 = encryptText(sensitivePhone);
    expect(enc1).not.toBe(enc2);
    expect(decryptText(enc1)).toBe(sensitivePhone);
    expect(decryptText(enc2)).toBe(sensitivePhone);
  });

  it('devrait préserver les données legacy en clair sans erreur', () => {
    const legacyValue = 'DonneeNonChiffree';
    expect(isEncrypted(legacyValue)).toBe(false);
    expect(decryptText(legacyValue)).toBe(legacyValue);
  });

  it('devrait chiffrer et déchiffrer fidèlement des buffers binaires (CVs / pièces d\'identité)', () => {
    const fakePdf = Buffer.from('%PDF-1.4 ... Contenu binaire simulé du CV de Sophie ... %%EOF');
    const { encryptedData, iv, tag } = encryptBuffer(fakePdf);

    expect(encryptedData.length).toBeGreaterThan(0);
    expect(encryptedData.equals(fakePdf)).toBe(false);

    const decrypted = decryptBuffer(encryptedData, iv, tag);
    expect(decrypted.equals(fakePdf)).toBe(true);
  });
});
