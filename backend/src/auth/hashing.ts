import bcrypt from 'bcryptjs';

/**
 * Hache un mot de passe en texte brut avec un sel de 10 tours (Bcrypt).
 *
 * @param password Mot de passe en clair
 * @returns Empreinte hachée
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Vérifie la correspondance entre un mot de passe en clair et son empreinte Bcrypt.
 *
 * @param hash Empreinte stockée
 * @param password Mot de passe candidat
 * @returns Booléen indiquant la validité du mot de passe
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
