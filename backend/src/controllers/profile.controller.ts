import { Request, Response } from 'express';
import { updateInterimaire, getInterimaireProfile, getRecruiterProfile } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase } from '../config/airtable';

// Helper pour extraire l'ID ou email utilisateur
function resolveUserId(req: Request): { userId: string | null; role: string | null } {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken<TokenPayload>(token);
      if (decoded && decoded.userId) {
        return { userId: String(decoded.userId), role: (decoded as any).role || null };
      }
    } catch (e) {
      console.warn("⚠️ [BACKEND] Token JWT non décodable dans profile.controller");
    }
  }

  const queryId = (req.query.userId as string) || (req.query.email as string) || (req.query.candidateId as string);
  if (queryId) {
    return { userId: queryId, role: (req.query.userMode as string) || null };
  }

  const bodyId = req.body?.userId || req.body?.email || req.body?.candidateId;
  if (bodyId) {
    return { userId: bodyId, role: req.body?.userMode || null };
  }

  return { userId: null, role: null };
}

// Récupérer le profil connecté depuis Airtable (Intérimaire ou Recruteur)
export const getProfile = async (req: Request, res: Response) => {
  try {
    let { userId, role } = resolveUserId(req);

    // Si aucun ID fourni, repli sur le premier intérimaire (mode dev / démo)
    if (!userId) {
      try {
        const firstCandidate = await airtableBase('Intérimaires').select({ maxRecords: 1 }).firstPage();
        if (firstCandidate.length > 0) {
          userId = firstCandidate[0].id;
        }
      } catch (e) {}
    }

    if (!userId) {
      return res.status(400).json({ message: "Identifiant ou email requis pour récupérer le profil." });
    }

    const isRecruiter = role === 'recruiter' || req.query.role === 'recruiter' || req.query.userMode === 'recruiter';

    if (isRecruiter) {
      const recruiterProfile = await getRecruiterProfile(userId);
      return res.status(200).json(recruiterProfile);
    }

    const candidateProfile = await getInterimaireProfile(userId);
    return res.status(200).json(candidateProfile);
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur GET /api/profile :", error);
    return res.status(500).json({ message: error.message || "Erreur lors de la récupération du profil." });
  }
};

// Enregistrer / Mettre à jour le profil dans Airtable
export const saveProfile = async (req: Request, res: Response) => {
  try {
    const { userId: bodyUserId, ...profileData } = req.body;
    let { userId } = resolveUserId(req);

    if (bodyUserId) {
      userId = bodyUserId;
    }

    if (!userId) {
      return res.status(400).json({ message: "Identifiant utilisateur manquant pour la mise à jour du profil." });
    }

    // Mise à jour de l'intérimaire dans Airtable
    const updatedRecord = await updateInterimaire(userId, profileData);

    // Rechargement du profil mis à jour pour renvoyer les données complètes
    let refreshedProfile: any = null;
    try {
      refreshedProfile = await getInterimaireProfile(updatedRecord?.id || userId);
    } catch (e) {
      refreshedProfile = updatedRecord?.fields || profileData;
    }

    console.log(`✅ [AIRTABLE] Profil intérimaire synchronisé avec succès pour ${userId}`);

    return res.status(200).json({
      message: "Profil enregistré avec succès",
      profile: refreshedProfile,
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/profile :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};