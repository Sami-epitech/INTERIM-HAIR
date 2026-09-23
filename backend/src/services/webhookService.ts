import mongoose from 'mongoose';
import { MatchNotification } from '../models/MatchNotification';

const DEFAULT_WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appUUSmomrRcjXvBE/wflZSeuaFdJWDAixi/wtrN6Z8Ffpcau35SO';
const DEFAULT_THRESHOLD = 60;

// Cache en mémoire pour garantir l'anti-doublon même si MongoDB est indisponible
const inMemoryNotified = new Set<string>();

/**
 * Paramètres nécessaires pour l'envoi de la notification webhook d'un match.
 */
export interface NotifyCandidateParams {
  candidatId: string;
  candidateEmail: string;
  candidateFirstName?: string;
  score: number;
  job: {
    id: string;
    title?: string;
    Title?: string;
    salon?: string;
    location?: string;
    rate?: number;
    dates?: string;
    shift?: string;
    skills?: string[];
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * Envoie une notification via le webhook Airtable pour un candidat dont le score de matching atteint le seuil.
 *
 * @param params - Détails du candidat, du score et de la mission.
 * @returns Statut de la notification et motif le cas échéant.
 */
export const sendMatchNotificationWebhook = async ({
  candidatId,
  candidateEmail,
  candidateFirstName,
  score,
  job
}: NotifyCandidateParams): Promise<{ notified: boolean; reason?: string }> => {
  try {
    const threshold = Number(process.env.MATCH_WEBHOOK_THRESHOLD) || DEFAULT_THRESHOLD;
    const webhookUrl = process.env.AIRTABLE_MATCHING_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
    const cacheKey = `${candidatId}:${job.id}`;

    // Vérification du seuil minimal
    if (score < threshold) {
      return { notified: false, reason: 'below_threshold' };
    }

    // Validation du format d'email
    if (!candidateEmail || !candidateEmail.includes('@')) {
      console.warn(`[WEBHOOK] Email candidat manquant ou invalide pour candidatId=${candidatId}`);
      return { notified: false, reason: 'invalid_email' };
    }

    // Vérification anti-doublon dans le cache mémoire
    if (inMemoryNotified.has(cacheKey)) {
      console.log(`[WEBHOOK] Offre ${job.id} déjà notifiée pour l'intérimaire ${candidateEmail} (cache mémoire actif)`);
      return { notified: false, reason: 'already_notified' };
    }

    // Vérification anti-doublon dans MongoDB si actif
    if (mongoose.connection.readyState === 1) {
      try {
        const alreadyNotified = await MatchNotification.findOne({
          candidatId,
          missionId: String(job.id)
        });

        if (alreadyNotified) {
          inMemoryNotified.add(cacheKey);
          console.log(`[WEBHOOK] Offre ${job.id} déjà notifiée pour l'intérimaire ${candidateEmail} (MongoDB actif)`);
          return { notified: false, reason: 'already_notified' };
        }
      } catch (err) {
        console.warn("[WEBHOOK] Impossible de vérifier MongoDB, recours au cache mémoire :", err);
      }
    }

    const jobTitle = job.title || job.Title || "Mission sans titre";
    const firstName = candidateFirstName || "Intérimaire";

    // Préparation de la charge utile pour le webhook
    const payload = {
      email: candidateEmail.trim().toLowerCase(),
      firstName,
      prenom: firstName,
      match: score,
      jobId: String(job.id),
      jobTitle,
      salon: job.salon || "Salon Partenaire",
      location: job.location || "Localisation non précisée",
      rate: Number(job.rate || 0),
      dates: job.dates || "",
      shift: job.shift || "",
      skills: job.skills || job.tags || [],
      job: {
        id: String(job.id),
        title: jobTitle,
        salon: job.salon || "Salon Partenaire",
        location: job.location || "Localisation non précisée",
        rate: Number(job.rate || 0),
        dates: job.dates || "",
        shift: job.shift || "",
        skills: job.skills || job.tags || []
      }
    };

    console.log(`[WEBHOOK] Envoi webhook Airtable pour ${candidateEmail} sur l'offre "${jobTitle}" (Match: ${score}%)`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[WEBHOOK] Échec de réponse Airtable (${response.status}) :`, errText);
      return { notified: false, reason: `http_error_${response.status}` };
    }

    // Mémorisation anti-doublon en cache et dans MongoDB
    inMemoryNotified.add(cacheKey);

    if (mongoose.connection.readyState === 1) {
      try {
        await MatchNotification.create({
          candidatId,
          candidateEmail: candidateEmail.trim().toLowerCase(),
          missionId: String(job.id),
          jobTitle,
          score,
          sentAt: new Date()
        });
        console.log(`[WEBHOOK] Notification enregistrée avec succès dans MongoDB pour ${candidateEmail} (Mission ${job.id})`);
      } catch (dbErr: any) {
        if (dbErr.code === 11000) {
          console.warn(`[WEBHOOK] Doublon MongoDB intercepté pour ${candidateEmail} / ${job.id}`);
        } else {
          console.error(`[WEBHOOK] Erreur lors de l'enregistrement dans MongoDB :`, dbErr);
        }
      }
    } else {
      console.log(`[WEBHOOK] Notification mémorisée dans le cache mémoire anti-doublon pour ${candidateEmail} (Mission ${job.id})`);
    }

    return { notified: true };
  } catch (err: any) {
    console.error(`[WEBHOOK] Erreur inattendue lors de l'envoi du webhook :`, err);
    return { notified: false, reason: err.message || 'unknown_error' };
  }
};

