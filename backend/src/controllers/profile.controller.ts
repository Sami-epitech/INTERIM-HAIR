import { Request, Response } from 'express';
import { updateInterimaire } from '../services/airtableService';

export const saveProfile = async (req: Request, res: Response) => {
  try {
    // Dans un vrai projet, l'ID de l'utilisateur vient du token JWT (req.user.id).
    // Pour la démo, on s'attend à le recevoir dans le body ou les headers, 
    // ou on gère une mise à jour sur la base de l'email/id transmis.
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Identifiant utilisateur manquant pour la mise à jour du profil." });
    }

    // Appel au service Airtable pour mettre à jour la ligne de l'intérimaire
    const updatedRecord = await updateInterimaire(userId, profileData);

    return res.status(200).json({
      message: "Profil enregistré avec succès",
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/profile :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};