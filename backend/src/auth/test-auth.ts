/**
 * Script de démonstration et validation manuelle des modules d'authentification :
 * - Hachage et vérification de mots de passe avec Bcrypt
 * - Émission, vérification et rejet de jetons JWT
 */
import { hashPassword, verifyPassword } from './hashing';
import { generateToken, verifyToken } from './jwt';

async function runDemo() {
    console.log('=== TEST DU MODULE HASHING (Bcrypt) ===');
    const password = 'MonMotDePasseSecret123!';
    console.log('1. Mot de passe original :', password);

    const hash = await hashPassword(password);
    console.log('2. Hash Bcrypt généré    :', hash);

    const isMatch = await verifyPassword(hash, password);
    console.log('3. Mot de passe correct ? :', isMatch);

    const isWrongMatch = await verifyPassword(hash, 'MauvaisMotDePasse');
    console.log('4. Mauvais mot de passe ? :', isWrongMatch);

    console.log('\n=== TEST DU MODULE JWT (Tokens) ===');
    const user = { userId: 42, email: 'ethan@example.com', role: 'admin' };
    console.log('1. Données utilisateur  :', user);

    const token = generateToken(user, '2h');
    console.log('2. Token JWT généré     :', token);

    const decoded = verifyToken(token);
    console.log('3. Token décodé avec succès ? :', decoded !== null);
    console.log('  Contenu décodé :', decoded);

    const fakeTokenCheck = verifyToken('token.invalide.123');
    console.log('4. Token invalide rejeté ? :', fakeTokenCheck === null);
}

runDemo();
