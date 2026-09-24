import { Request, Response } from 'express';
import { updateInterimaire, getInterimaireProfile, getRecruiterProfile } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase } from '../config/airtable';
import { calculateAndLogMatch } from '../services/matchingService';

/**
 * Extrait l'identifiant et le rôle de l'utilisateur depuis le jeton Bearer JWT,
 * les paramètres de requête ou le corps de la requête.
 */
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

/**
 * Récupère le profil de l'utilisateur connecté depuis Airtable (intérimaire ou recruteur).
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    let { userId, role } = resolveUserId(req);

    // Repli sur le premier intérimaire disponible en mode démonstration
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

/**
 * Enregistre ou met à jour les informations du profil intérimaire dans Airtable.
 */
export const saveProfile = async (req: Request, res: Response) => {
  try {
    const { userId: bodyUserId, location, ...profileData } = req.body;
    let { userId } = resolveUserId(req);

    if (bodyUserId) {
      userId = bodyUserId;
    }

    if (!userId) {
      return res.status(400).json({ message: "Identifiant utilisateur manquant pour la mise à jour du profil." });
    }

    // Normalisation de la localisation et de l'étendue de mobilité
    const dataToUpdate: any = { ...profileData };

    if (location) {
      if (typeof location === 'object' && location !== null) {
        dataToUpdate.location = location.city || "";
        dataToUpdate.mobility = location.mobility || "local";
      } else {
        dataToUpdate.location = String(location);
        dataToUpdate.mobility = "local";
      }
    }

    // Mise à jour de l'enregistrement dans Airtable
    const updatedRecord = await updateInterimaire(userId, dataToUpdate);

    // 🚀 AJOUT CLÉ : Recalculer les matchs pour cet intérimaire avec toutes les offres existantes
    try {
      const candidateRecord = await airtableBase('Intérimaires').find(updatedRecord?.id || userId);
      // Récupère toutes les offres (depuis ton service d'offres ou Airtable "Missions")
      const jobs = await airtableBase('Missions').select().all();
      
      for (const job of jobs) {
        await calculateAndLogMatch(candidateRecord, {
          id: job.id,
          ...job.fields,
          fields: job.fields
        });
      }
      console.log(`[MATCHING] Recalcul effectué pour le profil mis à jour de l'intérimaire ${userId}`);
    } catch (matchErr) {
      console.warn("⚠️ [MATCHING] Impossible de relancer le matching automatique post-onboarding :", matchErr);
    }

    // Rechargement du profil mis à jour
    let refreshedProfile: any = null;
    try {
      refreshedProfile = await getInterimaireProfile(updatedRecord?.id || userId);
    } catch (e) {
      refreshedProfile = updatedRecord?.fields || dataToUpdate;
    }

    return res.status(200).json({
      message: "Profil enregistré et matching mis à jour avec succès",
      profile: refreshedProfile,
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur /api/profile :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};