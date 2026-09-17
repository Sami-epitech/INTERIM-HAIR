import { connectDB } from './config/db';
import { 
  getOffresEmploi, 
  getInterimaires, 
  getCandidatures, 
  getRecruteurs 
} from './services/airtableService';

const startApp = async () => {
  console.log('🚀 Démarrage des tests d\'infrastructure...\n');

  // 1. Test de la connexion MongoDB
  await connectDB();

  // 2. Test d'accès aux tables Airtable
  try {
    console.log('\n📡 Interrogation de l\'API Airtable...');

    const offres = await getOffresEmploi();
    console.log(`  └─ Offres d'emploi : ${offres.length} dossier(s) trouvé(s)`);

    const interimaires = await getInterimaires();
    console.log(`  └─ Intérimaires     : ${interimaires.length} dossier(s) trouvé(s)`);

    const candidatures = await getCandidatures();
    console.log(`  └─ Candidatures     : ${candidatures.length} dossier(s) trouvé(s)`);

    const recruteurs = await getRecruteurs();
    console.log(`  └─ Recruteurs       : ${recruteurs.length} dossier(s) trouvé(s)`);

    console.log('\n✅ Tous les accès Airtable sont opérationnels !');
  } catch (error) {
    console.error('\n❌ Erreur lors des requêtes Airtable :', error);
  }
};

startApp();