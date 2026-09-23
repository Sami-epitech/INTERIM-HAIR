import { Request, Response } from 'express';
import { airtableBase as base } from '../config/airtable';
import { calculateAndLogMatch, matchNewJobWithCandidates } from '../services/matchingService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import fs from 'fs';
import path from 'path';

import { SALON_IMAGES, getSalonImage } from '../utils/salonImages';

// Récupérer les offres (Filtrées par e-mail recruteur OU Fil Candidat avec France Travail)
export const getJobs = async (req: Request, res: Response) => {
  try {
    let candidateId = req.query.candidateId as string;
    const recruiterEmail = req.query.recruiterEmail as string;
    const source = req.query.source as string;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken<TokenPayload>(token);
        if (decoded && decoded.userId) {
          candidateId = String(decoded.userId);
        }
      } catch (e) {
        console.warn("⚠️ [BACKEND] Token JWT ignoré ou invalide.");
      }
    }

    // 1. Récupération des offres depuis Airtable
    const airtableRecords = await base("Offres d'emploi").select().firstPage();
    
    let allJobs = airtableRecords
      .map((record: any) => {
        const f = record.fields;

        if (!f.title && !f.Title) return null;

        const storedEmail = f.recruiterId || f.recruiterEmail || "";
        const recordRecruiterEmail = Array.isArray(storedEmail) ? storedEmail[0] : storedEmail;

        return {
          id: record.id,
          title: f.title || f.Title || "Mission sans titre",
          description: f.description || "",
          startDate: f.startDate || "",
          endDate: f.endDate || "",
          dates: f.dates || (f.startDate ? `${f.startDate} – ${f.endDate || ''}` : "Dates à convenir"),
          sortDate: f.startDate ? f.startDate : new Date().toISOString(),
          location: f.location || "Localisation non précisée",
          rate: Number(f.rate || 0),
          shift: f.shift || "9h - 18h",
          skills: f.skills || f.tags || [],
          status: f.status || "open",
          publishedAt: f.publishedAt || new Date().toISOString(),
          salon: f.salon || "Salon Partenaire",
          recruiterEmail: recordRecruiterEmail,
          recruiterId: recordRecruiterEmail,
          contract: "Intérim",
          diplomas: ["CAP Coiffure"],
          benefits: ["Mutuelle"],
          match: 50,
          image: getSalonImage(record.id, f.image || f.photo)
        };
      })
      .filter((job): job is NonNullable<typeof job> => job !== null);

    // 2. Si filtre par e-mail recruteur (Dashboard Recruteur)
    if (recruiterEmail) {
      allJobs = allJobs.filter((job) => 
        job.recruiterEmail && job.recruiterEmail.toLowerCase() === recruiterEmail.toLowerCase()
      );
    }

    // 3. Si vue candidat (source === 'feed' ou candidateId présent), ajout des offres France Travail
    const isCandidateFeed = source === 'feed' || Boolean(candidateId) || (!recruiterEmail && source !== 'recruiter');
    
    if (isCandidateFeed) {
      // Détection dynamique du fichier offres-ft.json selon l'arborescence (dist ou src)
      const possiblePaths = [
        path.join(__dirname, '../offres-ft.json'),
        path.join(__dirname, '../../src/offres-ft.json'),
        path.join(process.cwd(), 'src/offres-ft.json'),
        path.join(process.cwd(), 'offres-ft.json')
      ];

      const jsonPath = possiblePaths.find(p => fs.existsSync(p));

      if (jsonPath) {
        try {
          const fileData = fs.readFileSync(jsonPath, 'utf-8');
          const ftJobs = JSON.parse(fileData);
          allJobs = [...allJobs, ...ftJobs];
          console.log(`✅ [BACKEND] ${ftJobs.length} offres France Travail ajoutées au feed candidat.`);
        } catch (err) {
          console.warn("⚠️ [BACKEND] Erreur lors de la lecture du fichier France Travail :", err);
        }
      } else {
        console.warn("⚠️ [BACKEND] Fichier offres-ft.json introuvable.");
      }
    }

    // 4. Algorithme de matching si candidat identifié
    if (candidateId) {
      try {
        const candidateRecord = await base('Intérimaires').find(candidateId);

        allJobs = await Promise.all(allJobs.map(async (job: any) => {
          const jobForMatching = {
            id: job.id,
            title: job.title,
            salon: job.salon,
            location: job.location,
            rate: job.rate,
            shift: job.shift,
            dates: job.dates,
            skills: job.skills,
            fields: {
              skills: job.skills,
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

        allJobs.sort((a: any, b: any) => b.match - a.match);
      } catch (err) {
        console.error("❌ Erreur lors du calcul du matching :", err);
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
    const { recruiterEmail, recruiterId, ...missionData } = req.body;

    if (!missionData.title || !missionData.location || !missionData.rate) {
      return res.status(400).json({ message: "Champs obligatoires manquants (titre, localisation, taux horaire)." });
    }

    const emailToSave = recruiterEmail || recruiterId || "recruteur@example.com";

    console.log("📥 [BACKEND] Enregistrement de la mission sur Airtable avec recruiterId =", emailToSave);

    const fieldsToCreate: any = {
      title: missionData.title,
      description: missionData.description || "",
      startDate: missionData.startDate || "",
      endDate: missionData.endDate || "",
      dates: missionData.dates || "",
      location: missionData.location,
      rate: Number(missionData.rate),
      shift: missionData.shift || "",
      skills: Array.isArray(missionData.skills) ? missionData.skills : [],
      status: missionData.status || "open",
      recruiterId: emailToSave,
      publishedAt: new Date().toISOString(),
    };

    const createdRecord = await base("Offres d'emploi").create(
      [
        {
          fields: fieldsToCreate,
        },
      ],
      { typecast: true }
    );

    const createdMission = {
      id: createdRecord[0].id,
      ...createdRecord[0].fields,
      image: getSalonImage(createdRecord[0].id, fieldsToCreate.image),
    };

    console.log("✅ [AIRTABLE] Enregistrement réussi ! ID :", createdRecord[0].id);

    // Déclenchement asynchrone du matching avec les intérimaires (tâche de fond)
    matchNewJobWithCandidates(createdMission).catch((err: any) => {
      console.error("❌ [BACKEND] Erreur tâche de fond matching nouvelle offre :", err);
    });

    return res.status(201).json({
      message: "Mission créée avec succès",
      mission: createdMission,
      job: createdMission,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur POST /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur lors de l'enregistrement sur Airtable." });
  }
};

// Mettre à jour une mission
export const patchJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || typeof id !== 'string' || !id.startsWith('rec')) {
      console.warn(`⚠️ [BACKEND] Tentative de mise à jour d'un enregistrement local/mock (ID: ${id})`);
      return res.status(200).json({
        message: "Mise à jour simulée (enregistrement local/mock)",
        mission: { id, ...updateData },
      });
    }

    const fieldsToUpdate: any = {
      title: updateData.title,
      description: updateData.description,
      location: updateData.location,
      rate: Number(updateData.rate),
      shift: updateData.shift,
      status: updateData.status,
    };

    if (updateData.skills) {
      fieldsToUpdate.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
    }

    const updatedRecord = await base("Offres d'emploi").update(
      [
        {
          id,
          fields: fieldsToUpdate,
        },
      ],
      { typecast: true }
    );

    return res.status(200).json({
      message: "Mission mise à jour avec succès",
      mission: updatedRecord[0],
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur PATCH /api/jobs/${req.params.id} :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};