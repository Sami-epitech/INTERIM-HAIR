import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

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
  // We can add more fields later for TK-014
}

/**
 * Step 1: Get the OAuth2 Access Token
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.FT_CLIENT_ID;
  const clientSecret = process.env.FT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing France Travail credentials in .env file");
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api_offresdemploiv2 o2dsoffre' 
  });

  const response = await fetch(FT_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Step 2: Fetch job offers for Hairdressing
 */
async function fetchHairdressingOffers(token: string): Promise<JobOffer[]> {
  // Using standard string addition (+) to avoid backtick/formatting issues
  const searchUrl = FT_API_URL + '?codeROME=' + ROME_COIFFURE;
  
  const response = await fetch(searchUrl, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch offers: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resultats || []; 
}

/**
 * Step 3: Deduplicate the offers
 */
function deduplicateOffers(offers: JobOffer[]): JobOffer[] {
  const uniqueOffersMap = new Map();
  
  for (const offer of offers) {
    // We use the France Travail unique ID as the primary key for deduplication
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
  .description('Fetch and deduplicate hairdressing jobs from France Travail')
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
      console.log(`🎯 Final count: ${cleanOffers.length} unique offers ready for the database.`);
      
      // For now, let's just log the first one to verify it works
      if (cleanOffers.length > 0) {
        console.log('\nSample Offer:', JSON.stringify(cleanOffers[0], null, 2));
      }

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();