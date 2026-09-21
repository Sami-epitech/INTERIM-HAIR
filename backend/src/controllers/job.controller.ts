import { Request, Response } from 'express';
import { base } from '../config/airtable';
import { createMission, updateMission } from '../services/airtableService';
import { calculateAndLogMatch } from '../services/matchingService';
import { verifyToken, TokenPayload } from '../auth/jwt'; // 👈 Ajout du module de ton pote
import fs from 'fs';
import path from 'path';

// Récupérer toutes les offres (France Travail + Airtable) et calculer le MATCH
export const getJobs = async (req: Request, res: Response) => {
  try {
    // 1. Récupération de l'ID candidat depuis le token JWT ou l'URL
    let candidateId = req.query.candidateId as string;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken<TokenPayload>(token);
        if (decoded && decoded.userId) {
          candidateId = String(decoded.userId);
        }
      } catch (e) {
        console.warn("⚠️ [BACKEND] Token JWT ignoré ou invalide pour le matching.");
      }
    }

    // 2. Récupération des offres Airtable créées par les recruteurs
    const airtableRecords = await base("Offres d'emploi").select({ filterByFormula: "{status} = 'open'" }).firstPage();
    
    let allJobs = airtableRecords.map((record: any) => ({
      id: record.id,
      title: record.fields.title,
      description: record.fields.description,
      startDate: record.fields.startDate,
      endDate: record.fields.endDate,
      dates: record.fields.dates,
      location: record.fields.location,
      rate: record.fields.rate,
      shift: record.fields.shift,
      tags: record.fields.skills || [],
      status: record.fields.status,
      salon: "Salon Partenaire", // Valeur par défaut
      contract: "Intérim",
      diplomas: ["CAP Coiffure"],
      benefits: ["Mutuelle", "primes"],
      match: 80, // Score par défaut qui sera écrasé par l'algo
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"
    }));

    // 3. Chargement optionnel des offres France Travail
    const jsonPath = path.join(__dirname, '../offres-ft.json');
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, 'utf-8');
      const ftJobs = JSON.parse(fileData);
      allJobs = [...allJobs, ...ftJobs];
    }

    // 4. ALGORITHME DE MATCHING (Si on a bien identifié le candidat)
    if (candidateId) {
      try {
        // On va chercher les critères du candidat dans Airtable
        const candidateRecord = await base('Intérimaires').find(candidateId);

        // On calcule le score pour chaque offre et on log dans MongoDB
        allJobs = await Promise.all(allJobs.map(async (job) => {
          const jobForMatching = {
            id: job.id,
            fields: {
              skills: job.tags,
              location: job.location,
              rate: job.rate,
              shift: job.shift,
              startDate: job.startDate,
              endDate: job.endDate
            }
          };

          const score = await calculateAndLogMatch(candidateRecord, jobForMatching);
          return { ...job, match: score };
        }));

        // On trie : les meilleurs matchs (100%) apparaissent en premier !
        allJobs.sort((a, b) => b.match - a.match);

      } catch (err) {
        console.error("❌ [BACKEND] Erreur lors du calcul du matching, renvoi des offres par défaut :", err);
      }
    }

    return res.status(200).json(allJobs);
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur GET /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Créer une nouvelle mission (Recruteur)
export const postJob = async (req: Request, res: Response) => {
  try {
    const { recruiterId, ...missionData } = req.body;

    if (!missionData.title || !missionData.location || !missionData.rate) {
      return res.status(400).json({ message: "Champs obligatoires manquants (titre, localisation, taux horaire)." });
    }

    // Extraction de l'ID via JWT (si ton pote l'a prévu pour les recruteurs, sinon on garde le fallback)
    let targetRecruiterId = recruiterId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && !targetRecruiterId) {
      try {
        const decoded = verifyToken<TokenPayload>(authHeader.substring(7));
        if (decoded && decoded.userId) targetRecruiterId = String(decoded.userId);
      } catch (e) {}
    }

    targetRecruiterId = targetRecruiterId || "rec_default_id";

    const newMission = await createMission(targetRecruiterId, missionData);

    return res.status(201).json({
      message: "Mission créée avec succès",
      mission: newMission,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur POST /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Mettre à jour une mission (MissionEditScreen)
export const patchJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await updateMission(id, updateData);

    return res.status(200).json({
      message: "Mission mise à jour avec succès",
      mission: updated,
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur PATCH /api/jobs/${req.params.id} :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};