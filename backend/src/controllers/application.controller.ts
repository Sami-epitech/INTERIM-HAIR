import { Request, Response } from 'express';
import { createCandidature } from '../services/airtableService';

// Postuler à une mission
export const applyToMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const { candidateId } = req.body; // ID Airtable de l'intérimaire

    if (!candidateId || !missionId) {
      return res.status(400).json({ message: "Identifiant candidat et ID de mission requis." });
    }

    // Création de la ligne dans la table de jointure "Candidatures" d'Airtable
    const newApplication = await createCandidature(candidateId, missionId);

    return res.status(201).json({
      message: "Candidature envoyée avec succès",
      application: newApplication,
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur POST /api/missions/${req.params.missionId}/applications :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};