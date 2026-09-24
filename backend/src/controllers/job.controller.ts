import { Request, Response } from 'express';
import { airtableBase as base } from '../config/airtable';
import { calculateAndLogMatch, matchNewJobWithCandidates } from '../services/matchingService';
import { verifyToken, TokenPayload } from '../auth/jwt';
import fs from 'fs';
import path from 'path';

import { getSalonImage } from '../utils/salonImages';

/**
 * Récupère les offres d'emploi.
 * - Mode recruteur : filtrage par email du recruteur
 * - Mode candidat : agrégation des offres Airtable et des offres France Travail,
 *   avec calcul dynamique des scores de matching si le candidat est identifié.
 */
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

    // 🛡️ REPLI ROBUSTE : Si aucun ID ou token n'est passé au rechargement (F5), on prend le premier profil dispo
    if (!candidateId && !recruiterEmail) {
      try {
        const defaultCandidate = await base('Intérimaires').select({ maxRecords: 1 }).firstPage();
        if (defaultCandidate.length > 0) {
          candidateId = defaultCandidate[0].id;
          console.log(`🔄 [BACKEND] Rechargement détecté sans ID : utilisation du profil de repli ${candidateId}`);
        }
      } catch (e) {}
    }

    // Récupération des offres publiées dans Airtable
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

    // Filtrage par recruteur si demandé (tableau de bord recruteur)
    if (recruiterEmail) {
      allJobs = allJobs.filter((job) => 
        job.recruiterEmail && job.recruiterEmail.toLowerCase() === recruiterEmail.toLowerCase()
      );
    }

    // Inclusion des offres France Travail pour le flux candidat
    const isCandidateFeed = source === 'feed' || Boolean(candidateId) || (!recruiterEmail && source !== 'recruiter');
    
    if (isCandidateFeed) {
      // Résolution du chemin vers les offres France Travail sauvegardées localement
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
        } catch (err) {
          console.warn("⚠️ [BACKEND] Erreur lors de la lecture du fichier France Travail :", err);
        }
      } else {
        console.warn("⚠️ [BACKEND] Fichier offres-ft.json introuvable.");
      }
    }

    // Évaluation algorithmique du matching lorsque le candidat est identifié
    if (candidateId) {
      try {
        let candidateRecord: any = null;
        try {
          candidateRecord = await base('Intérimaires').find(candidateId);
        } catch (err) {
          // Si l'ID direct échoue, on cherche par email ou on prend le premier enregistrement par défaut
          const matchingCandidates = await base('Intérimaires').select({
            filterByFormula: `{email} = '${candidateId}'`
          }).firstPage();
          
          if (matchingCandidates.length > 0) {
            candidateRecord = matchingCandidates[0];
          } else {
            const firstFallback = await base('Intérimaires').select({ maxRecords: 1 }).firstPage();
            candidateRecord = firstFallback[0];
          }
        }

        if (candidateRecord) {
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

          // Tri décroissant selon le score de compatibilité
          allJobs.sort((a: any, b: any) => b.match - a.match);
        }
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

/**
 * Crée une nouvelle offre de mission (espace recruteur) dans Airtable,
 * puis déclenche l'évaluation de compatibilité avec les profils intérimaires existants.
 */
export const postJob = async (req: Request, res: Response) => {
  try {
    const { recruiterEmail, recruiterId, ...missionData } = req.body;

    if (!missionData.title || !missionData.location || !missionData.rate) {
      return res.status(400).json({ message: "Champs obligatoires manquants (titre, localisation, taux horaire)." });
    }

    const emailToSave = recruiterEmail || recruiterId || "recruteur@example.com";

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

    // Déclenchement asynchrone du matching avec la base des intérimaires
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

/**
 * Met à jour les informations d'une mission existante dans Airtable.
 */
export const patchJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prise en charge des identifiants locaux simulés
    if (!id || typeof id !== 'string' || !id.startsWith('rec')) {
      return res.status(200).json({
        message: "Mise à jour simulée (enregistrement local)",
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