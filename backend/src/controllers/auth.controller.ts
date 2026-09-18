import { Request, Response } from 'express';
import { base } from '../config/airtable';
import { createUser } from '../services/airtableService';

// Inscription (Signup)
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, userMode } = req.body;

    // Validation de base
    if (!email || !password || !userMode || !name) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs requis." });
    }

    // Appel au service Airtable pour insérer dans la bonne table
    const newUser = await createUser({ name, email, password, userMode });

    return res.status(201).json({
      message: "Compte créé avec succès",
      userId: newUser.id,
      user: {
        email: newUser.fields.email,
        name: newUser.fields.name,
        userMode
      }
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/auth/signup :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Connexion (Login)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, userMode } = req.body;

    if (!email || !password || !userMode) {
      return res.status(400).json({ message: "Email, mot de passe et rôle requis." });
    }

    // Détermination de la table selon le rôle
    const tableName = userMode === 'candidate' ? 'Intérimaires' : 'Recruteurs';

    // Recherche de l'utilisateur par email dans Airtable
    const records = await base(tableName)
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const user = records[0];
    
    // Vérification basique du mot de passe (en clair pour le projet d'école)
    if (user.fields.password !== password) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    return res.status(200).json({
      message: "Connexion réussie",
      userId: user.id,
      user: {
        email: user.fields.email,
        name: user.fields.name,
        userMode
      }
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/auth/login :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};