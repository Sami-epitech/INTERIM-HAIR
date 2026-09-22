import { Request, Response } from 'express';
import { createCandidature, getCandidaturesWithDetails } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase as base } from '../config/airtable';

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

    const applications = await getCandidaturesWithDetails({
      candidateId: candidateId || undefined,
      recruiterEmail: recruiterEmail || undefined,
      missionId: missionId || undefined,
    });

    return res.status(200).json(applications);
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