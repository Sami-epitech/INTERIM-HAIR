import mongoose from 'mongoose';
import { MatchingLog } from '../models/MatchingLog';
import { airtableBase } from '../config/airtable';
import { sendMatchNotificationWebhook } from './webhookService';

/**
 * Coefficients de pondération bilatérale des critères de matching.
 */
const WEIGHTS = {
  candidate: { salary: 0.30, location: 0.40, schedule: 0.10, duration: 0.10, skills: 0.10 },
  recruiter: { skills: 0.20, schedule: 0.20, duration: 0.20, location: 0.30, salary: 0.10 }
};

/**
 * Table de correspondance pour associer une ville de référence à ses codes postaux ou variantes fréquentes.
 */
const CITY_MAPPINGS: Record<string, string[]> = {
  "paris": ["paris", "75", "île-de-france", "ile-de-france"],
  "lyon": ["lyon", "69"],
  "marseille": ["marseille", "13"],
  "bordeaux": ["bordeaux", "33"],
  "lille": ["lille", "59"],
  "toulouse": ["toulouse", "31"],
  "nice": ["nice", "06"],
  "nantes": ["nantes", "44"],
  "strasbourg": ["strasbourg", "67"],
  "rennes": ["rennes", "35"]
};

/**
 * Calcule le score d'adéquation des compétences (sur 100).
 */
const calculateSkillsScore = (jobSkills: string[], candidateSkills: string[]): number => {
  if (!jobSkills.length || !candidateSkills.length) return 50;
  const matches = jobSkills.filter(s => candidateSkills.includes(s));
  return (matches.length / jobSkills.length) * 100;
};

/**
 * Calcule le score géographique avec des logs de debug pour identifier le blocage.
 */
const calculateLocationScore = (jobLocation: string, candidateCity: string, candidateMobility: string): number => {
  console.log(`🔍 [DEBUG MATCHING] jobLocation reçue: "${jobLocation}" | candidateCity reçue: "${candidateCity}" | mobility: "${candidateMobility}"`);

  if (candidateMobility === "national") {
    return 100;
  }

  if (!jobLocation || !candidateCity) {
    console.warn("⚠️ [DEBUG MATCHING] L'un des champs de localisation est vide !");
    return 0;
  }

  const normJob = jobLocation.toLowerCase().trim();
  const normCandidate = candidateCity.toLowerCase().trim();

  // 1. Recherche directe par inclusion textuelle simple
  if (normJob.includes(normCandidate) || normCandidate.includes(normJob)) {
    console.log("✅ [DEBUG MATCHING] Match géographique direct trouvé !");
    return 100;
  }

  // 2. Recherche par table de correspondance élargie (gestion des codes postaux/départements comme "59", "75", etc.)
  for (const [key, variants] of Object.entries(CITY_MAPPINGS)) {
    if (normCandidate.includes(key)) {
      const matchFound = variants.some(variant => normJob.includes(variant));
      if (matchFound) {
        console.log(`✅ [DEBUG MATCHING] Match géographique via mapping '${key}' trouvé !`);
        return 100;
      }
    }
  }

  console.log("❌ [DEBUG MATCHING] Aucun match géographique trouvé.");
  return 0;
};

/**
 * Calcule le score salarial selon l'écart au tarif horaire souhaité.
 */
const calculateSalaryScore = (jobRate: number, candidateExpectedRate: number): number => {
  if (jobRate >= candidateExpectedRate) return 100;
  const diff = candidateExpectedRate - jobRate;
  return Math.max(0, 100 - (diff * 10));
};

/**
 * Calcule le score des horaires.
 */
const calculateScheduleScore = (jobShift: string, candStart: string, candEnd: string) => 90;

/**
 * Calcule le score de durée de la mission.
 */
const calculateDurationScore = (jobStart: string, jobEnd: string, candStart: string, candEnd: string) => 95;

/**
 * Calcule le score global de matching entre un candidat et une offre,
 * enregistre l'historique dans MongoDB et déclenche une notification si le seuil est atteint.
 */
export const calculateAndLogMatch = async (candidate: any, job: any) => {
  const fields = candidate.fields || candidate;

  const candidateSkills = fields.skills || fields.tags || [];
  
  // 🔍 Extraction ciblée sur 'locationCity' (et replis de secours)
  const rawLocation = 
    fields.locationCity || 
    fields.location || 
    fields.Location || 
    fields.ville || 
    fields.Ville || 
    fields.city || 
    fields.City;

  let candidateCity = "";
  if (typeof rawLocation === "object" && rawLocation !== null) {
    candidateCity = rawLocation.city || rawLocation.ville || Object.values(rawLocation)[0] || "";
  } else {
    candidateCity = String(rawLocation || "");
  }

  const rawMobility = fields.mobility || fields.Mobility;
  const candidateMobility = (typeof rawLocation === "object" && rawLocation !== null ? rawLocation.mobility : rawMobility) || "local";

  console.log(`👤 [DEBUG CANDIDAT] ID: ${candidate.id || 'inconnu'} | Ville extraite: "${candidateCity}" | Mobilité: "${candidateMobility}"`);

  const expectedRate = Number(fields.expectedRate || fields.rate || 10);
  const jobFields = job.fields || job;

  // Calcul des scores élémentaires
  const skillsScore = calculateSkillsScore(jobFields.skills || job.skills || [], candidateSkills);
  const locationScore = calculateLocationScore(jobFields.location || job.location, candidateCity, candidateMobility);
  const salaryScore = calculateSalaryScore(Number(jobFields.rate || job.rate || 0), expectedRate);
  const scheduleScore = calculateScheduleScore(jobFields.shift || job.shift, fields.availabilityStartHour, fields.availabilityEndHour);
  const durationScore = calculateDurationScore(jobFields.startDate || job.startDate, jobFields.endDate || job.endDate, fields.availabilityFrom, fields.availabilityTo);

  // Application des pondérations bilatérales
  const candidateScore = 
    (salaryScore * WEIGHTS.candidate.salary) +
    (locationScore * WEIGHTS.candidate.location) +
    (scheduleScore * WEIGHTS.candidate.schedule) +
    (durationScore * WEIGHTS.candidate.duration) +
    (skillsScore * WEIGHTS.candidate.skills);

  const recruiterScore = 
    (skillsScore * WEIGHTS.recruiter.skills) +
    (scheduleScore * WEIGHTS.recruiter.schedule) +
    (durationScore * WEIGHTS.recruiter.duration) +
    (locationScore * WEIGHTS.recruiter.location) +
    (salaryScore * WEIGHTS.recruiter.salary);

  const finalScore = Math.round((candidateScore + recruiterScore) / 2);

  const candidateId = candidate.id || candidate._id || candidate.userId || fields.id || 'unknown_candidate';

  // Persistance dans MongoDB si la connexion est établie
  if (mongoose.connection.readyState === 1) {
    try {
      // Utilisation de findOneAndUpdate avec upsert=true pour éviter les doublons
      await MatchingLog.findOneAndUpdate(
        { 
          candidatId: candidateId, 
          missionId: String(job.id) 
        },
        {
          $set: {
            score: finalScore,
            candidateScore: Math.round(candidateScore),
            recruiterScore: Math.round(recruiterScore),
            criteriaDetails: {
              salaryScore: Math.round(salaryScore),
              scheduleScore: Math.round(scheduleScore),
              skillsScore: Math.round(skillsScore),
              locationScore: Math.round(locationScore),
              durationScore: Math.round(durationScore)
            }
          }
        },
        { 
          upsert: true,
          new: true
        }
      );
    } catch (err) {
      console.error("[MONGODB] Erreur lors de la sauvegarde du log de matching :", err);
    }
  }

  // Déclenchement de la notification webhook si le score atteint le seuil configuré
  const threshold = Number(process.env.MATCH_WEBHOOK_THRESHOLD) || 60;
  if (finalScore >= threshold) {
    const candidateEmail = fields.email || fields.Email || candidate.email;
    const candidateFirstName = fields.firstName || fields.Prenom || fields['Prénom'] || (fields.name ? String(fields.name).split(' ')[0] : undefined) || candidate.firstName;
    
    if (candidateEmail && candidateEmail.toLowerCase().includes('epitech')) {
      await sendMatchNotificationWebhook({
        candidatId: candidateId,
        candidateEmail,
        candidateFirstName,
        score: finalScore,
        job
      });
    }
  }

  return finalScore;
};

/**
 * Évalue une nouvelle offre auprès de l'ensemble des intérimaires enregistrés.
 */
export const matchNewJobWithCandidates = async (job: any) => {
  try {
    const candidates = await airtableBase('Intérimaires').select().all();
    console.log(`[MATCHING] Nouvelle offre reçue (ID: ${job.id}, Titre: "${job.title || job.Title}"). Évaluation contre ${candidates.length} intérimaire(s)...`);

    const jobForMatching = {
      id: job.id,
      title: job.title || job.Title,
      salon: job.salon,
      location: job.location,
      rate: job.rate,
      shift: job.shift,
      dates: job.dates,
      skills: job.skills,
      fields: {
        skills: job.skills || [],
        location: job.location || job.lieuTravail?.libelle || "",
        rate: job.rate || 0,
        shift: job.shift || "",
        startDate: job.startDate || "",
        endDate: job.endDate || ""
      }
    };

    for (const candidate of candidates) {
      await calculateAndLogMatch(candidate, jobForMatching);
    }
    console.log(`[MATCHING] Évaluation terminée pour la nouvelle offre ${job.id}.`);
  } catch (error) {
    console.error("[MATCHING] Erreur lors de l'évaluation de la nouvelle offre avec les candidats :", error);
  }
};