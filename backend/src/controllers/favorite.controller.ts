import { Request, Response } from 'express';
import {
  getInterimaireFavorites,
  addInterimaireFavorite,
  removeInterimaireFavorite,
} from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase } from '../config/airtable';

// Helper pour extraire l'ID du candidat (JWT, query, body ou fallback premier candidat)
async function resolveCandidateId(req: Request): Promise<string | null> {
  // 1. Depuis le header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken<TokenPayload>(token);
      if (decoded && decoded.userId) {
        return String(decoded.userId);
      }
    } catch (e) {
      console.warn("⚠️ [BACKEND] Token invalide pour resolveCandidateId");
    }
  }

  // 2. Depuis la query string
  if (req.query.candidateId) {
    return String(req.query.candidateId);
  }

  // 3. Depuis le body
  if (req.body && req.body.candidateId) {
    return String(req.body.candidateId);
  }

  // 4. Fallback vers le premier intérimaire trouvé en base (utile en dev/test)
  try {
    const firstCandidate = await airtableBase('Intérimaires').select({ maxRecords: 1 }).firstPage();
    if (firstCandidate.length > 0) {
      return firstCandidate[0].id;
    }
  } catch (e) {
    console.error("❌ [BACKEND] Impossible de trouver un candidat de fallback :", e);
  }

  return null;
}

// Récupérer les favoris du candidat connecté
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const candidateId = await resolveCandidateId(req);

    if (!candidateId) {
      return res.status(400).json({ message: "Identifiant candidat manquant." });
    }

    const { favoriteIds, jobs } = await getInterimaireFavorites(candidateId);

    return res.status(200).json({
      candidateId,
      favoriteIds,
      jobs,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur GET /api/favorites :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Ajouter une offre aux favoris dans Airtable (concaténation)
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const candidateId = await resolveCandidateId(req);
    const { jobId, jobData } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Identifiant candidat manquant." });
    }

    if (!jobId) {
      return res.status(400).json({ message: "jobId obligatoire pour ajouter un favori." });
    }

    const result = await addInterimaireFavorite(candidateId, String(jobId), jobData);

    console.log(`⭐ [BACKEND] Favori ${jobId} ajouté dans Airtable pour candidat ${candidateId}. Favoris actuels:`, result.favoriteIds);

    return res.status(200).json({
      message: "Favori ajouté avec succès dans Airtable",
      candidateId,
      favoriteIds: result.favoriteIds,
      addedId: result.addedId,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur POST /api/favorites :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Retirer une offre des favoris dans Airtable
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const candidateId = await resolveCandidateId(req);
    const jobId = req.params.jobId || req.body.jobId;

    if (!candidateId) {
      return res.status(400).json({ message: "Identifiant candidat manquant." });
    }

    if (!jobId) {
      return res.status(400).json({ message: "jobId obligatoire pour supprimer un favori." });
    }

    const result = await removeInterimaireFavorite(candidateId, String(jobId));

    console.log(`🗑️ [BACKEND] Favori ${jobId} retiré dans Airtable pour candidat ${candidateId}. Favoris restants:`, result.favoriteIds);

    return res.status(200).json({
      message: "Favori retiré avec succès dans Airtable",
      candidateId,
      favoriteIds: result.favoriteIds,
      removedId: result.removedId,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur DELETE /api/favorites :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Basculer l'état d'un favori (ajouter ou retirer)
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const candidateId = await resolveCandidateId(req);
    const { jobId, jobData } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Identifiant candidat manquant." });
    }

    if (!jobId) {
      return res.status(400).json({ message: "jobId obligatoire pour basculer un favori." });
    }

    const { favoriteIds: currentFavorites } = await getInterimaireFavorites(candidateId);
    const targetId = String(jobId);

    const isAlreadyFavorite = currentFavorites.includes(targetId);

    if (isAlreadyFavorite) {
      const result = await removeInterimaireFavorite(candidateId, targetId);
      return res.status(200).json({
        message: "Favori retiré avec succès dans Airtable",
        isFavorite: false,
        candidateId,
        favoriteIds: result.favoriteIds,
      });
    } else {
      const result = await addInterimaireFavorite(candidateId, targetId, jobData);
      return res.status(200).json({
        message: "Favori ajouté avec succès dans Airtable",
        isFavorite: true,
        candidateId,
        favoriteIds: result.favoriteIds,
      });
    }
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur POST /api/favorites/toggle :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};
