import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

/**
 * Données embarquées dans la charge utile du jeton JWT.
 */
export interface TokenPayload {
    userId: string | number;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

/**
 * Génère un jeton JWT signé numériquement.
 *
 * @param payload Données utilisateur à inclure (identifiant, rôle, etc.)
 * @param expiresIn Durée de validité (ex. '1h', '24h', '30s')
 * @returns Jeton JWT encodé sous forme de chaîne
 */
export function generateToken(payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '1h'): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Vérifie l'authenticité d'un jeton JWT et en extrait la charge utile.
 *
 * @param token Jeton JWT à vérifier
 * @returns Données décodées ou null si le jeton est invalide ou expiré
 */
export function verifyToken<T = TokenPayload>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch {
        return null;
    }
}
