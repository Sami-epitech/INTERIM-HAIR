// backend/src/services/matchingService.ts

import { MatchingLog } from '../models/MatchLog';

// 1. Les fameuses pondérations (en pourcentages)
const WEIGHTS = {
  candidate: { salary: 0.30, location: 0.30, schedule: 0.20, duration: 0.10, skills: 0.10 },
  recruiter: { skills: 0.40, schedule: 0.30, duration: 0.15, location: 0.10, salary: 0.05 }
};

// 2. Fonctions de calcul (Les maths)
const calculateSkillsScore = (jobSkills: string[], candidateSkills: string[]): number => {
  if (!jobSkills.length) return 100;
  const matches = jobSkills.filter(s => candidateSkills.includes(s));
  return (matches.length / jobSkills.length) * 100;
};

const calculateLocationScore = (jobLocation: string, candidateCity: string, radius: number): number => {
  return 85; // Score fictif en attendant le calcul de distance réel (Google Maps API etc.)
};

const calculateSalaryScore = (jobRate: number, candidateExpectedRate: number): number => {
  if (jobRate >= candidateExpectedRate) return 100;
  const diff = candidateExpectedRate - jobRate;
  return Math.max(0, 100 - (diff * 10)); // Baisse de 10 points par euro manquant
};

const calculateScheduleScore = (jobShift: string, candStart: string, candEnd: string) => 90; // À affiner
const calculateDurationScore = (jobStart: string, jobEnd: string, candStart: string, candEnd: string) => 95; // À affiner

// 3. La fonction principale (Celle appelée par le contrôleur)
export const calculateAndLogMatch = async (candidate: any, job: any) => {
  // A. Calcul des scores bruts sur 100 pour chaque critère
  const skillsScore = calculateSkillsScore(job.fields.skills || [], candidate.fields.skills || []);
  const locationScore = calculateLocationScore(job.fields.location, candidate.fields.locationCity, candidate.fields.locationRadiusKm);
  const expectedRate = candidate.fields.expectedRate || 10;
  const salaryScore = calculateSalaryScore(job.fields.rate, expectedRate);
  const scheduleScore = calculateScheduleScore(job.fields.shift, candidate.fields.availabilityStartHour, candidate.fields.availabilityEndHour);
  const durationScore = calculateDurationScore(job.fields.startDate, job.fields.endDate, candidate.fields.availabilityFrom, candidate.fields.availabilityTo);

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

  // C. Score final
  const finalScore = Math.round((candidateScore + recruiterScore) / 2);

  // D. Enregistrement silencieux dans MONGODB
  try {
    const logEntry = new MatchingLog({
      candidatId: candidate.id, // Ton nom de variable
      missionId: job.id,        // Ton nom de variable
      score: finalScore,        // Ton nom de variable
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
    console.log(`✅ [MONGODB] Match calculé et sauvegardé : ${finalScore}%`);
  } catch (err) {
    console.error("❌ [MONGODB] Erreur lors de la sauvegarde du log :", err);
  }

  // E. On renvoie le score au contrôleur
  return finalScore;
};