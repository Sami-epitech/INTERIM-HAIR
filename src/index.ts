import { connectDB } from './config/db';
import { MatchingLog } from './models/MatchingLog';

const startServer = async () => {
  // 1. Connexion à la BDD Docker
  await connectDB();

  // 2. Test rapide d'écriture d'un log de matching
  try {
    const testLog = await MatchingLog.create({
      candidatId: 'cand_123',
      missionId: 'miss_456',
      score: 95
    });
    console.log('📝 Log de test créé avec succès :', testLog);
  } catch (err) {
    console.error('❌ Erreur de création du log :', err);
  }
};

startServer();