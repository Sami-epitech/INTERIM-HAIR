import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

export interface TokenPayload {
    userId: string | number;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

/**
 * Génère un jeton JWT signé
 * @param payload Données à intégrer dans le token (userId, role, etc.)
 * @param expiresIn Durée de validité (ex: '1h', '7d', '15m')
 */
export function generateToken(payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '1h'): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Vérifie et décode un jeton JWT
 * @param token Le jeton JWT à valider
 * @returns Le payload décodé ou null si invalide/expiré
 */
export function verifyToken<T = TokenPayload>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch {
        return null;
    }
}
