// backend/src/services/matchingService.ts

import { MatchingLog } from '../models/MatchingLog';

// 1. Les fameuses pondérations (en pourcentages)
const WEIGHTS = {
  candidate: { salary: 0.30, location: 0.30, schedule: 0.20, duration: 0.10, skills: 0.10 },
  recruiter: { skills: 0.40, schedule: 0.30, duration: 0.15, location: 0.10, salary: 0.05 }
};

// 2. Fonctions de calcul (Les maths)
const calculateSkillsScore = (jobSkills: string[], candidateSkills: string[]): number => {
  if (!jobSkills.length || !candidateSkills.length) return 50; // Valeur par défaut neutre si manquant
  const matches = jobSkills.filter(s => candidateSkills.includes(s));
  return (matches.length / jobSkills.length) * 100;
};

// 👇 Logique de localisation basée sur le choix Local vs National
const calculateLocationScore = (jobLocation: string, candidateCity: string, candidateMobility: string): number => {
  // Si le candidat a choisi d'être mobile sur toute la France -> 100% de match
  if (candidateMobility === "national") {
    return 100;
  }

  if (!jobLocation || !candidateCity) return 0;

  const normJob = jobLocation.toLowerCase().trim();
  const normCandidate = candidateCity.toLowerCase().trim();

  // Comparaison par inclusion de chaîne (ex: "Paris" correspond à "Paris et Île-de-France")
  if (normJob.includes(normCandidate) || normCandidate.includes(normJob)) {
    return 100;
  }

  return 0; // Hors de la ville sélectionnée pour un profil non-mobile
};

const calculateSalaryScore = (jobRate: number, candidateExpectedRate: number): number => {
  if (jobRate >= candidateExpectedRate) return 100;
  const diff = candidateExpectedRate - jobRate;
  return Math.max(0, 100 - (diff * 10)); // Baisse de 10 points par euro manquant
};

const calculateScheduleScore = (jobShift: string, candStart: string, candEnd: string) => 90; // À affiner si besoin
const calculateDurationScore = (jobStart: string, jobEnd: string, candStart: string, candEnd: string) => 95; // À affiner si besoin

// 3. La fonction principale (Celle appelée par le contrôleur)
export const calculateAndLogMatch = async (candidate: any, job: any) => {
  const fields = candidate.fields || {};

  // Extraction propre des données du candidat depuis Airtable
  const candidateSkills = fields.skills || fields.tags || [];
  const candidateCity = fields.location || "";
  const candidateMobility = fields.mobility || "local"; // "local" ou "national"
  const expectedRate = Number(fields.expectedRate || fields.rate || 10);

  // A. Calcul des scores bruts sur 100 pour chaque critère
  const skillsScore = calculateSkillsScore(job.fields.skills || [], candidateSkills);
  const locationScore = calculateLocationScore(job.fields.location, candidateCity, candidateMobility);
  const salaryScore = calculateSalaryScore(Number(job.fields.rate || 0), expectedRate);
  const scheduleScore = calculateScheduleScore(job.fields.shift, fields.availabilityStartHour, fields.availabilityEndHour);
  const durationScore = calculateDurationScore(job.fields.startDate, job.fields.endDate, fields.availabilityFrom, fields.availabilityTo);

  // B. Application de l'importance des critères (Pondérations)
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

  // C. Score final (arrondi à l'entier le plus proche)
  const finalScore = Math.round((candidateScore + recruiterScore) / 2);

  // D. Enregistrement silencieux dans MONGODB
  try {
    const logEntry = new MatchingLog({
      candidatId: candidate.id,
      missionId: job.id,
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
    console.log(`✅ [MONGODB] Match calculé et sauvegardé pour le candidat ${candidate.id} (Offre ${job.id}) : ${finalScore}%`);
  } catch (err) {
    console.error("❌ [MONGODB] Erreur lors de la sauvegarde du log :", err);
  }

  // E. On renvoie le score au contrôleur
  return finalScore;
};