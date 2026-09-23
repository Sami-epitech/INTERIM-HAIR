/**
 * Tests unitaires du module d'authentification (hachage de mot de passe et jetons JWT).
 */

import { hashPassword, verifyPassword } from '../src/auth/hashing';
import { generateToken, verifyToken, TokenPayload } from '../src/auth/jwt';

describe('Authentification, Hachage et Jetons JWT', () => {
  const rawPassword = 'MonSuperMotDePasse123!';

  describe('Hachage & Comparaison de mot de passe (Bcrypt)', () => {
    it('devrait hacher le mot de passe et générer un hash différent du texte brut', async () => {
      const hash = await hashPassword(rawPassword);
      expect(hash).not.toBe(rawPassword);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('devrait valider avec succès le mot de passe correct', async () => {
      const hash = await hashPassword(rawPassword);
      const isMatch = await verifyPassword(hash, rawPassword);
      expect(isMatch).toBe(true);
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      const hash = await hashPassword(rawPassword);
      const isMatch = await verifyPassword(hash, 'MauvaisMotDePasse');
      expect(isMatch).toBe(false);
    });
  });

  describe('Génération et Vérification de Tokens JWT', () => {
    const payload: TokenPayload = {
      userId: 'recUser123456',
      email: 'coiffeur@test.com',
      role: 'candidate'
    };

    it('devrait générer un token JWT valide et décodable', () => {
      const token = generateToken(payload, '1h');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = verifyToken<TokenPayload>(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('devrait retourner null pour un token altéré ou invalide', () => {
      const token = generateToken(payload, '1h');
      const corruptedToken = token.slice(0, -5) + 'abcde';
      expect(verifyToken<TokenPayload>(corruptedToken)).toBeNull();
    });
  });
});
