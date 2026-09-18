import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charge le fichier .env situé à la racine du monorepo
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Désactive la vérification stricte SSL pour le développement local
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const program = new Command();

// France Travail API configuration
const FT_AUTH_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire';
const FT_API_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';
const ROME_COIFFURE = 'D1202';

interface JobOffer {
  id: string;
  intitule: string;
  description: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  typeContratLibelle?: string;
  salaire?: { libelle?: string };
  competences?: Array<{ libelle: string }>;
  dateCreation?: string;
}

/**
 * Step 1: Get the OAuth2 Access Token
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.FT_CLIENT_ID;
  const clientSecret = process.env.FT_CLIENT_SECRET;

  console.log(`🔍 Verification des identifiants : Client ID présent = ${!!clientId}, Secret présent = ${!!clientSecret}`);

  if (!clientId || !clientSecret) {
    throw new Error("Missing France Travail credentials in .env file");
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api_offresdemploiv2 o2dsoffre' 
  });

  console.log(`🌐 Tentative de connexion vers : ${FT_AUTH_URL}`);
  
  try {
    const response = await fetch(FT_AUTH_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'InterimHair-CLI/1.0'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status} (${response.statusText}): ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (err: any) {
    // Log détaillé pour capturer les erreurs réseau profondes de fetch
    console.error('🔍 Détails réseau de l’échec d’authentification :');
    console.error(`- Nom de l'erreur : ${err?.name}`);
    console.error(`- Message : ${err?.message}`);
    if (err?.cause) {
      console.error('- Cause racine :', err.cause);
    }
    throw err;
  }
}

/**
 * Step 2: Fetch job offers for Hairdressing
 */
async function fetchHairdressingOffers(token: string): Promise<JobOffer[]> {
  const searchUrl = FT_API_URL + '?codeROME=' + ROME_COIFFURE;
  console.log(`🌐 Récupération des offres depuis : ${searchUrl}`);
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        'User-Agent': 'InterimHair-CLI/1.0'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status} (${response.statusText}): ${errorText}`);
    }

    const data = await response.json();
    return data.resultats || [];
  } catch (err: any) {
    console.error('🔍 Détails réseau de l’échec de récupération des offres :');
    console.error(`- Message : ${err?.message}`);
    if (err?.cause) {
      console.error('- Cause racine :', err.cause);
    }
    throw err;
  }
}

/**
 * Step 3: Deduplicate the offers
 */
function deduplicateOffers(offers: JobOffer[]): JobOffer[] {
  const uniqueOffersMap = new Map();
  
  for (const offer of offers) {
    if (!uniqueOffersMap.has(offer.id)) {
      uniqueOffersMap.set(offer.id, offer);
    }
  }

  return Array.from(uniqueOffersMap.values());
}

// --- CLI Setup ---

program
  .name('interim-hair-cli')
  .description('CLI for Interim Hair data ingestion')
  .version('1.0.0');

program
  .command('fetch-jobs')
  .description('Fetch, deduplicate and save hairdressing jobs from France Travail')
  .action(async () => {
    try {
      console.log('⏳ Authenticating with France Travail...');
      const token = await getAccessToken();
      
      console.log('✅ Authenticated! Fetching jobs for ROME D1202 (Coiffure)...');
      const rawOffers = await fetchHairdressingOffers(token);
      console.log(`📥 Fetched ${rawOffers.length} raw offers.`);

      const cleanOffers = deduplicateOffers(rawOffers);
      const duplicatesRemoved = rawOffers.length - cleanOffers.length;
      
      console.log(`🧹 Deduplication complete. Removed ${duplicatesRemoved} duplicate(s).`);
      console.log(`🎯 Final count: ${cleanOffers.length} unique offers.`);
      
      // Ecriture du fichier JSON pour le Back-End
      const outputDir = path.join(__dirname, '../../backend/src');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const outputPath = path.join(outputDir, 'offres-ft.json');
      fs.writeFileSync(outputPath, JSON.stringify(cleanOffers, null, 2));

      console.log(`💾 Offres enregistrées avec succès dans : ${outputPath}`);

    } catch (error) {
      console.error('\n❌ Execution failed.');
      process.exit(1);
    }
  });

program.parse();