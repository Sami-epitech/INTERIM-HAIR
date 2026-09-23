import { Request, Response } from 'express';
import { createCandidature, getCandidaturesWithDetails } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase as base } from '../config/airtable';
import { MatchingLog } from '../models/MatchingLog'; // 👈 On importe ton modèle MongoDB !

// Helper pour extraire l'ID du candidat
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

// Récupérer la liste des candidatures enrichies (pour candidat ou recruteur)
export const getApplications = async (req: Request, res: Response) => {
  try {
    const candidateId = (req.query.candidateId as string) || resolveCandidateId(req);
    const recruiterEmail = req.query.recruiterEmail as string;
    const missionId = (req.query.missionId as string) || (req.params.missionId as string);

    // 1. Récupération brute depuis Airtable
    const applications = await getCandidaturesWithDetails({
      candidateId: candidateId || undefined,
      recruiterEmail: recruiterEmail || undefined,
      missionId: missionId || undefined,
    });

    // 2. 👇 Enrichissement avec le SCORE RECRUTEUR depuis MongoDB
    const enrichedApplications = await Promise.all(applications.map(async (app: any) => {
      // Airtable renvoie parfois les relations sous forme de tableaux ["recXXX"]
      const candId = Array.isArray(app.candidateId) ? app.candidateId[0] : (app.candidateId || app.candidatId);
      const missId = Array.isArray(app.missionId) ? app.missionId[0] : app.missionId;

      let recruiterMatch = 0; // Valeur par défaut si aucun log n'est trouvé

      if (candId && missId) {
        try {
          // On cherche le dernier log calculé pour ce duo (Candidat / Offre)
          const log = await MatchingLog.findOne({ candidatId: candId, missionId: missId }).sort({ createdAt: -1 });
          
          if (log) {
            // C'est ICI qu'on sélectionne le point de vue du recruteur !
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

// Postuler à une mission
export const applyToMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    let candidateId = req.body.candidateId || resolveCandidateId(req);

    // Si non connecté / mode démo : fallback sur le premier candidat Airtable
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

    // Création de la candidature dans la table "Candidatures" d'Airtable
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