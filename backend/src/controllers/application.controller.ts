import { Request, Response } from 'express';
import { createCandidature, getCandidaturesWithDetails } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase as base } from '../config/airtable';
import { MatchingLog } from '../models/MatchingLog';

/**
 * Extrait l'identifiant du candidat depuis le jeton d'authentification Bearer,
 * ou en repli depuis les paramètres de la requête.
 */
function resolveCandidateId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken<TokenPayload>(token);
      if (decoded && decoded.userId) {
        return String(decoded.userId);
      }
    } catch (e) {}
  }

  return (req.query.candidateId as string) || (req.body?.candidateId as string) || null;
}

/**
 * Récupère les candidatures enrichies pour un candidat ou un recruteur.
 * Croise les données Airtable avec les scores de compatibilité enregistrés dans MongoDB.
 */
export const getApplications = async (req: Request, res: Response) => {
  try {
    const candidateId = (req.query.candidateId as string) || resolveCandidateId(req);
    const recruiterEmail = req.query.recruiterEmail as string;
    const missionId = (req.query.missionId as string) || (req.params.missionId as string);

    // Récupération des enregistrements depuis Airtable
    const applications = await getCandidaturesWithDetails({
      candidateId: candidateId || undefined,
      recruiterEmail: recruiterEmail || undefined,
      missionId: missionId || undefined,
    });

    // Enrichissement des candidatures avec les scores récents issus de MongoDB
    const enrichedApplications = await Promise.all(applications.map(async (app: any) => {
      // Normalisation des relations Airtable (parfois encapsulées dans des tableaux)
      const candId = Array.isArray(app.candidateId) ? app.candidateId[0] : (app.candidateId || app.candidatId);
      const missId = Array.isArray(app.missionId) ? app.missionId[0] : app.missionId;

      let recruiterMatch = 0;

      if (candId && missId) {
        try {
          // Recherche du dernier log calculé pour ce binôme candidat/mission
          const log = await MatchingLog.findOne({ candidatId: candId, missionId: missId }).sort({ createdAt: -1 });
          
          if (log) {
            recruiterMatch = log.score; 
          }
        } catch (err) {
          console.error("⚠️ [MONGODB] Erreur lecture log matching :", err);
        }
      }

      return {
        ...app,
        match: recruiterMatch > 0 ? recruiterMatch : (app.match || 0)
      };
    }));

    return res.status(200).json(enrichedApplications);
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur GET /api/applications :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

/**
 * Enregistre la candidature d'un intérimaire pour une mission donnée.
 */
export const applyToMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    let candidateId = req.body.candidateId || resolveCandidateId(req);

    // Repli sur le premier candidat en base si aucun identifiant n'est fourni
    if (!candidateId) {
      try {
        const defaultCandidates = await base('Intérimaires').select({ maxRecords: 1 }).firstPage();
        if (defaultCandidates.length > 0) {
          candidateId = defaultCandidates[0].id;
        }
      } catch (e) {
        console.warn("⚠️ [BACKEND] Impossible de charger un intérimaire par défaut :", e);
      }
    }

    if (!candidateId || !missionId) {
      return res.status(400).json({ message: "Identifiant candidat et ID de mission requis." });
    }

    // Persistance de la candidature dans Airtable
    const newApplication = await createCandidature(candidateId, missionId);

    return res.status(201).json({
      message: "Candidature envoyée avec succès au recruteur",
      application: newApplication,
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur POST /api/missions/${req.params.missionId}/applications :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};