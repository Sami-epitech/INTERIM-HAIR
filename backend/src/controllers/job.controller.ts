import { Request, Response } from 'express';
import { airtableBase as base } from '../config/airtable';
import { createMission, updateMission } from '../services/airtableService';
import { calculateAndLogMatch } from '../services/matchingService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import fs from 'fs';
import path from 'path';

// Récupérer toutes les offres (France Travail + Airtable)
export const getJobs = async (req: Request, res: Response) => {
  try {
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

    // Récupération des offres Airtable (sans filtre strict pour éviter de masquer les nouvelles missions créées)
    const airtableRecords = await base("Offres d'emploi").select().firstPage();
    
    let allJobs = airtableRecords.map((record: any) => ({
      id: record.id,
      title: record.fields.title || record.fields.Title || "Mission sans titre",
      description: record.fields.description || "",
      startDate: record.fields.startDate || "",
      endDate: record.fields.endDate || "",
      dates: record.fields.dates || `${record.fields.startDate || ""} – ${record.fields.endDate || ""}`,
      location: record.fields.location || "",
      rate: Number(record.fields.rate || 0),
      shift: record.fields.shift || "09:00 - 18:00",
      tags: record.fields.skills || record.fields.tags || [],
      status: record.fields.status || "open",
      salon: record.fields.salon || "Salon Partenaire",
      contract: "Intérim",
      diplomas: ["CAP Coiffure"],
      benefits: ["Mutuelle", "Primes"],
      match: 85,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"
    }));

    // Chargement optionnel des offres France Travail
    const jsonPath = path.join(__dirname, '../offres-ft.json');
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, 'utf-8');
      const ftJobs = JSON.parse(fileData);
      allJobs = [...allJobs, ...ftJobs];
    }

    // Algorithme de matching si candidat identifié
    if (candidateId) {
      try {
        const candidateRecord = await base('Intérimaires').find(candidateId);

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

        allJobs.sort((a, b) => b.match - a.match);

      } catch (err) {
        console.error("❌ [BACKEND] Erreur lors du calcul du matching :", err);
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

    console.log("📥 [BACKEND] Création de la mission dans Airtable :", missionData);

    // Écriture directe dans la table "Offres d'emploi"
    const createdRecord = await base("Offres d'emploi").create([
      {
        fields: {
          title: missionData.title,
          description: missionData.description || "",
          startDate: missionData.startDate || "",
          endDate: missionData.endDate || "",
          dates: missionData.dates || "",
          location: missionData.location,
          rate: Number(missionData.rate),
          shift: missionData.shift || "",
          skills: missionData.skills || [],
          status: "open",
        },
      },
    ]);

    const createdMission = {
      id: createdRecord[0].id,
      ...createdRecord[0].fields,
    };

    console.log("✅ [AIRTABLE] Mission ajoutée avec succès dans Airtable ! ID :", createdRecord[0].id);

    return res.status(201).json({
      message: "Mission créée avec succès",
      mission: createdMission,
      job: createdMission,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur lors de la création Airtable POST /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur lors de l'enregistrement sur Airtable." });
  }
};

// Mettre à jour une mission
export const patchJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRecord = await base("Offres d'emploi").update([
      {
        id,
        fields: {
          title: updateData.title,
          description: updateData.description,
          location: updateData.location,
          rate: Number(updateData.rate),
          shift: updateData.shift,
          status: updateData.status,
        },
      },
    ]);

    return res.status(200).json({
      message: "Mission mise à jour avec succès",
      mission: updatedRecord[0],
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur PATCH /api/jobs/${req.params.id} :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};