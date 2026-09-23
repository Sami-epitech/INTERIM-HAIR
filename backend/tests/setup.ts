import dotenv from 'dotenv';
import path from 'path';

// Charge le .env racine puis backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Valeurs de secours sûres pour les tests unitaires
process.env.AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'pat_test_key_12345';
process.env.AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app_test_base_12345';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret_de_test_pour_jwt_123456';
process.env.MATCH_WEBHOOK_THRESHOLD = process.env.MATCH_WEBHOOK_THRESHOLD || '60';
