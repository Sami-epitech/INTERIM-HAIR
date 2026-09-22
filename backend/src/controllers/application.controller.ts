import { Request, Response } from 'express';
import { createCandidature } from '../services/airtableService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import { airtableBase as base } from '../config/airtable';

// Postuler à une mission
export const applyToMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    let candidateId = req.body.candidateId; // ID Airtable de l'intérimaire

    // 1. Récupération automatique via le Bearer Token JWT si non fourni dans le corps
    const authHeader = req.headers.authorization;
    if (!candidateId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken<TokenPayload>(token);
        if (decoded && decoded.userId) {
          candidateId = String(decoded.userId);
        }
      } catch (e) {
        console.warn("⚠️ [BACKEND] Token JWT invalide dans applyToMission.");
      }
    }

    // 2. Si non connecté / mode démo : fallback sur le premier candidat Airtable
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