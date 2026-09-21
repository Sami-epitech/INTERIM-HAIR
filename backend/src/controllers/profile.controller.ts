import { Request, Response } from 'express';
import { updateInterimaire } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const { userId: bodyUserId, ...profileData } = req.body;

    // Récupération de l'identifiant soit depuis le token JWT (Authorization: Bearer <token>), soit depuis le body
    let userId = bodyUserId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken<TokenPayload>(token);
      if (decoded && decoded.userId) {
        userId = String(decoded.userId);
      }
    }

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