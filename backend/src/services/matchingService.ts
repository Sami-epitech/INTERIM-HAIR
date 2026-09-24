import mongoose from 'mongoose';
import { MatchingLog } from '../models/MatchingLog';
import { airtableBase } from '../config/airtable';
import { sendMatchNotificationWebhook } from './webhookService';

/**
 * Coefficients de pondération bilatérale des critères de matching.
 */
const WEIGHTS = {
  candidate: { salary: 0.10, location: 0.70, schedule: 0.10, duration: 0.05, skills: 0.05 },
  recruiter: { skills: 0.10, schedule: 0.05, duration: 0.10, location: 0.70, salary: 0.05 }
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
 * Calcule le score géographique selon la mobilité (locale ou nationale).
 */
const calculateLocationScore = (jobLocation: string, candidateCity: string, candidateMobility: string): number => {
  if (candidateMobility === "national") {
    return 100;
  }

  if (!jobLocation || !candidateCity) return 0;

  const normJob = jobLocation.toLowerCase().trim();
  const normCandidate = candidateCity.toLowerCase().trim();

  if (normJob.includes(normCandidate) || normCandidate.includes(normJob)) {
    return 100;
  }

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
 *
 * @param candidate - Données de l'intérimaire (format Airtable).
 * @param job - Données de la mission.
 * @returns Score global pondéré sur 100.
 */
export const calculateAndLogMatch = async (candidate: any, job: any) => {
  const fields = candidate.fields || {};

  const candidateSkills = fields.skills || fields.tags || [];
  const candidateCity = fields.location || "";
  const candidateMobility = fields.mobility || "local";
  const expectedRate = Number(fields.expectedRate || fields.rate || 10);

  const jobFields = job.fields || {};

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
      const logEntry = new MatchingLog({
        candidatId: candidateId,
        missionId: String(job.id),
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
      });
      await logEntry.save();
      console.log(`[MONGODB] Match enregistré pour le candidat ${candidateId} (Offre ${job.id}) : ${finalScore}%`);
    } catch (err) {
      console.error("[MONGODB] Erreur lors de la sauvegarde du log de matching :", err);
    }
  }

  // Déclenchement de la notification webhook si le score atteint le seuil configuré
  const threshold = Number(process.env.MATCH_WEBHOOK_THRESHOLD) || 60;
  if (finalScore >= threshold) {
    const candidateEmail = fields.email || fields.Email || candidate.email;
    const candidateFirstName = fields.firstName || fields.Prenom || fields['Prénom'] || (fields.name ? String(fields.name).split(' ')[0] : undefined) || candidate.firstName;
    
    // Condition : l'adresse email doit contenir "epitech" pour déclencher le webhook Airtable
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
 *
 * @param job - Nouvelle offre à faire correspondre.
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
        location: job.location || "",
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

