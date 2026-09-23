import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Établit la connexion à la base de données MongoDB.
 * En cas d'échec critique, interrompt le processus Node.js.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('✅ Base MongoDB connectée avec succès !');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB :', error);
    process.exit(1);
  }
};