import { airtableBase } from '../config/airtable';

// 1. Récupérer les offres d'emploi (pour le matching)
export const getOffresEmploi = async () => {
  try {
    const records = await airtableBase("Offres d'emploi").select().firstPage();
    return records.map((record) => ({
      id: record.id,
      fields: record.fields,
    }));
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des offres :", error);
    throw error;
  }
};

// 2. Récupérer les intérimaires (pour le matching)
export const getInterimaires = async () => {
  try {
    const records = await airtableBase('Intérimaires').select().firstPage();
    return records.map((record) => ({
      id: record.id,
      fields: record.fields,
    }));
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des intérimaires :', error);
    throw error;
  }
};

// 3. Récupérer les candidatures
export const getCandidatures = async () => {
  try {
    const records = await airtableBase('Candidatures').select().firstPage();
    return records.map((record) => ({
      id: record.id,
      fields: record.fields,
    }));
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidatures :', error);
    throw error;
  }
};

// 4. Récupérer les recruteurs
export const getRecruteurs = async () => {
  try {
    const records = await airtableBase('Recruteurs').select().firstPage();
    return records.map((record) => ({
      id: record.id,
      fields: record.fields,
    }));
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des recruteurs :', error);
    throw error;
  }
};