import { Request, Response } from 'express';
import { airtableBase as base } from '../config/airtable';
import { createUser } from '../services/airtableService';
import { hashPassword, verifyPassword } from '../auth/hashing';
import { generateToken } from '../auth/jwt';

// Inscription (Signup)
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, userMode, rememberMe } = req.body;

    // Validation de base : email, password et userMode uniquement
    if (!email || !password || !userMode) {
      return res.status(400).json({ message: "Veuillez renseigner un email et un mot de passe." });
    }

    // Validation du format de l'adresse email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Format d'adresse email invalide." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const tableName = userMode === 'candidate' ? 'Intérimaires' : 'Recruteurs';

    // Vérification si un compte existe déjà avec cette adresse email
    const existingRecords = await base(tableName)
      .select({
        filterByFormula: `{email} = '${cleanEmail}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (existingRecords.length > 0) {
      return res.status(409).json({ message: "Un compte est déjà créé avec cette adresse email." });
    }

    // Hachage immédiat du mot de passe avec Bcrypt
    const passwordHash = await hashPassword(password);

    // Envoi du profil et du hash du mot de passe vers Airtable
    const newUser = await createUser({
      name: name || "",
      email: cleanEmail,
      password: passwordHash,
      userMode,
    });

    // Durée du token : 24 heures si "Rester connecté" est coché, sinon 30 secondes
    const tokenDuration = rememberMe ? '24h' : '30s';

    const token = generateToken(
      {
        userId: newUser.id,
        email: newUser.fields.email ? String(newUser.fields.email) : undefined,
        name: newUser.fields.name ? String(newUser.fields.name) : undefined,
        role: userMode,
      },
      tokenDuration
    );

    console.log(`📥 [BACKEND] Inscription réussie sur Airtable pour : ${email} (${userMode})`);

    // Réponse sécurisée : token JWT + infos publiques
    return res.status(201).json({
      message: "Compte créé avec succès",
      token,
      userId: newUser.id,
      user: {
        email: newUser.fields.email,
        name: newUser.fields.name,
        userMode,
      },
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/auth/signup :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Connexion (Login)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, userMode, rememberMe } = req.body;

    if (!email || !password || !userMode) {
      return res.status(400).json({ message: "Email, mot de passe et rôle requis." });
    }

    // Détermination de la table selon le rôle
    const cleanEmail = email.trim().toLowerCase();
    const tableName = userMode === 'candidate' ? 'Intérimaires' : 'Recruteurs';

    // Recherche de l'utilisateur par email dans Airtable
    const records = await base(tableName)
      .select({
        filterByFormula: `{email} = '${cleanEmail}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const user = records[0];
    const storedHash = user.fields.password as string | undefined;

    if (!storedHash) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérification du mot de passe input avec le hash stocké dans Airtable via Bcrypt
    const isPasswordValid = await verifyPassword(storedHash, password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    // Durée du token : 24 heures si "Rester connecté" est coché, sinon 30 secondes
    const tokenDuration = rememberMe ? '24h' : '30s';

    const token = generateToken(
      {
        userId: user.id,
        email: user.fields.email ? String(user.fields.email) : undefined,
        name: user.fields.name ? String(user.fields.name) : undefined,
        role: userMode,
      },
      tokenDuration
    );

    console.log(`✅ [BACKEND] Connexion validée via Airtable pour : ${email} (${userMode})`);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      userId: user.id,
      user: {
        email: user.fields.email,
        name: user.fields.name,
        userMode,
      },
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/auth/login :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};
