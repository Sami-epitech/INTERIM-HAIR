import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('❌ Configuration Airtable manquante dans le .env');
}

// Initialisation de la base Airtable
export const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID || ''
);