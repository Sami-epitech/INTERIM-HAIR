import mongoose from 'mongoose';
import { MatchNotification } from '../models/MatchNotification';

const DEFAULT_WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appUUSmomrRcjXvBE/wflZSeuaFdJWDAixi/wtrN6Z8Ffpcau35SO';
const DEFAULT_THRESHOLD = 60;

// Cache en mémoire pour garantir l'anti-doublon même si MongoDB est hors-ligne
const inMemoryNotified = new Set<string>();

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

    // 1. Vérification du seuil
    if (score < threshold) {
      return { notified: false, reason: 'below_threshold' };
    }

    // 2. Vérification que l'email est valide
    if (!candidateEmail || !candidateEmail.includes('@')) {
      console.warn(`⚠️ [WEBHOOK] Email candidat manquant ou invalide pour candidatId=${candidatId}`);
      return { notified: false, reason: 'invalid_email' };
    }

    // 3. Vérification anti-doublon (Cache mémoire d'abord)
    if (inMemoryNotified.has(cacheKey)) {
      console.log(`ℹ️ [WEBHOOK] Offre ${job.id} déjà notifiée pour l'intérimaire ${candidateEmail} (Cache mémoire actif)`);
      return { notified: false, reason: 'already_notified' };
    }

    // Vérification anti-doublon dans MongoDB si connecté
    if (mongoose.connection.readyState === 1) {
      try {
        const alreadyNotified = await MatchNotification.findOne({
          candidatId,
          missionId: String(job.id)
        });

        if (alreadyNotified) {
          inMemoryNotified.add(cacheKey);
          console.log(`ℹ️ [WEBHOOK] Offre ${job.id} déjà notifiée pour l'intérimaire ${candidateEmail} (MongoDB actif)`);
          return { notified: false, reason: 'already_notified' };
        }
      } catch (err) {
        console.warn("⚠️ [WEBHOOK] Impossible de vérifier MongoDB, passage sur cache mémoire :", err);
      }
    }

    const jobTitle = job.title || job.Title || "Mission sans titre";
    const firstName = candidateFirstName || "Intérimaire";

    // 4. Préparation du payload (champs plats + objet complet)
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

    console.log(`🚀 [WEBHOOK] Envoi webhook Airtable pour ${candidateEmail} sur l'offre "${jobTitle}" (Match: ${score}%)`);

    // 5. Envoi HTTP POST vers Airtable
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ [WEBHOOK] Échec réponse Airtable (${response.status}) :`, errText);
      return { notified: false, reason: `http_error_${response.status}` };
    }

    // 6. Enregistrement anti-doublon (Cache mémoire + MongoDB si connecté)
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
        console.log(`✅ [WEBHOOK] Notification enregistrée avec succès dans MongoDB pour ${candidateEmail} (Mission ${job.id})`);
      } catch (dbErr: any) {
        // Ignorer l'erreur de duplicata si déclenché en parallèle
        if (dbErr.code === 11000) {
          console.warn(`ℹ️ [WEBHOOK] Doublon MongoDB intercepté pour ${candidateEmail} / ${job.id}`);
        } else {
          console.error(`❌ [WEBHOOK] Erreur enregistrement MongoDB :`, dbErr);
        }
      }
    } else {
      console.log(`ℹ️ [WEBHOOK] Notification mémorisée dans le cache mémoire anti-doublon pour ${candidateEmail} (Mission ${job.id})`);
    }

    return { notified: true };
  } catch (err: any) {
    console.error(`❌ [WEBHOOK] Erreur inattendue lors de l'envoi du webhook :`, err);
    return { notified: false, reason: err.message || 'unknown_error' };
  }
};
