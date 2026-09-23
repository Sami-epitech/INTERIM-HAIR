import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Charge les variables d'environnement depuis le .env racine
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { sendMatchNotificationWebhook } from './services/webhookService';
import { MatchNotification } from './models/MatchNotification';

async function runTests() {
  console.log("🚀 Démarrage des tests du webhook et de l'anti-doublon...");

  let isMongoConnected = false;
  try {
    console.log("🔗 Tentative de connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || '', { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log("✅ Connecté à MongoDB.");
  } catch (err: any) {
    console.warn("⚠️ MongoDB non disponible localement (mode cache mémoire actif) :", err.message);
  }

  const testJob = {
    id: "test-mission-tk015-" + Date.now(),
    title: "Coiffeur Polyvalent H/F Test",
    salon: "Salon Prestige Test",
    location: "Paris 11e",
    rate: 16,
    dates: "Du 25/09 au 30/09",
    shift: "09:00 - 18:00",
    skills: ["Coupe femme", "Coloration", "Brushing"]
  };

  const testCandidate = {
    candidatId: "cand-test-tk015-" + Date.now(),
    candidateEmail: "ethan.copin@epitech.eu"
  };

  if (isMongoConnected) {
    await MatchNotification.deleteMany({
      candidatId: testCandidate.candidatId,
      missionId: testJob.id
    });
  }

  console.log("\n🧪 --- TEST 1 : Score inférieur au seuil (50% < 60%) ---");
  const resLow = await sendMatchNotificationWebhook({
    candidatId: testCandidate.candidatId,
    candidateEmail: testCandidate.candidateEmail,
    score: 50,
    job: testJob
  });
  console.log("Résultat TEST 1 (attendu: notified=false, reason='below_threshold') :", resLow);
  if (resLow.notified !== false || resLow.reason !== 'below_threshold') {
    throw new Error("Échec TEST 1");
  }

  console.log("\n🧪 --- TEST 2 : Premier envoi avec score >= 60% (78% >= 60%) ---");
  const resHigh = await sendMatchNotificationWebhook({
    candidatId: testCandidate.candidatId,
    candidateEmail: testCandidate.candidateEmail,
    score: 78,
    job: testJob
  });
  console.log("Résultat TEST 2 (attendu: notified=true) :", resHigh);
  if (!resHigh.notified) {
    throw new Error("Échec TEST 2");
  }

  if (isMongoConnected) {
    const notificationInDb = await MatchNotification.findOne({
      candidatId: testCandidate.candidatId,
      missionId: testJob.id
    });
    console.log("Enregistrement en BDD (anti-doublon) :", notificationInDb ? `Trouvé (score: ${notificationInDb.score}%, sentAt: ${notificationInDb.sentAt})` : "NON TROUVÉ ❌");
    if (!notificationInDb) {
      throw new Error("Échec TEST 2 : l'entrée n'a pas été enregistrée dans MatchNotification");
    }
  }

  console.log("\n🧪 --- TEST 3 : Deuxième appel pour la même offre (Anti-Doublon / Anti-Spam) ---");
  const resDuplicate = await sendMatchNotificationWebhook({
    candidatId: testCandidate.candidatId,
    candidateEmail: testCandidate.candidateEmail,
    score: 82,
    job: testJob
  });
  console.log("Résultat TEST 3 (attendu: notified=false, reason='already_notified') :", resDuplicate);
  if (resDuplicate.notified !== false || resDuplicate.reason !== 'already_notified') {
    throw new Error("Échec TEST 3 : le doublon n'a pas été bloqué");
  }

  if (isMongoConnected) {
    await MatchNotification.deleteMany({
      candidatId: testCandidate.candidatId,
      missionId: testJob.id
    });
    await mongoose.disconnect();
  }

  console.log("\n🎉 TOUS LES TESTS SONT VALIDÉS AVEC SUCCÈS !");
}

runTests().catch(err => {
  console.error("❌ Erreur pendant l'exécution des tests :", err);
  process.exit(1);
});
