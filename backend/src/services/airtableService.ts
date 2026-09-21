import { airtableBase } from '../config/airtable';

// ════════════════════════════════════════════════════════════
// 1. FONCTIONS DE LECTURE (Déjà présentes dans ton service)
// ════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════
// 2. FONCTIONS D'ÉCRITURE & MISE À JOUR (Pour les contrôleurs)
// ════════════════════════════════════════════════════════════

// Inscription (AuthScreen)
export const createUser = async (userData: any) => {
  const tableName = userData.userMode === 'candidate' ? 'Intérimaires' : 'Recruteurs';
  
  const record = await airtableBase(tableName).create([
    {
      fields: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    },
  ]);
  
  return record[0];
};

// Mise à jour profil intérimaire (ManualEntry, CVUpload, Onboarding2)
export const updateInterimaire = async (recordId: string, profileData: any) => {
  const fieldsToUpdate: any = {};

  if (profileData.source === 'cv_upload' && profileData.name) {
    const [first, ...rest] = profileData.name.split(' ');
    fieldsToUpdate.firstName = first;
    fieldsToUpdate.lastName = rest.join(' ');
  } else if (profileData.source === 'manual_entry') {
    if (profileData.firstName) fieldsToUpdate.firstName = profileData.firstName;
    if (profileData.lastName) fieldsToUpdate.lastName = profileData.lastName;
    if (profileData.phone) fieldsToUpdate.phone = profileData.phone;
    if (profileData.bio) fieldsToUpdate.bio = profileData.bio;
  }

  if (profileData.diploma) fieldsToUpdate.diploma = profileData.diploma;
  if (profileData.skills) fieldsToUpdate.skills = profileData.skills;
  if (profileData.experienceLevel) fieldsToUpdate.experienceLevel = profileData.experienceLevel;
  if (profileData.expectedRate) fieldsToUpdate.expectedRate = profileData.expectedRate;

  if (profileData.location) {
    fieldsToUpdate.locationCity = profileData.location.city;
    fieldsToUpdate.locationRadiusKm = profileData.location.radiusKm;
  }
  if (profileData.availability) {
    fieldsToUpdate.availabilityFrom = profileData.availability.from;
    fieldsToUpdate.availabilityTo = profileData.availability.to;
    fieldsToUpdate.availabilityDays = profileData.availability.days;
    if (profileData.availability.hours) {
      fieldsToUpdate.availabilityStartHour = profileData.availability.hours.start;
      fieldsToUpdate.availabilityEndHour = profileData.availability.hours.end;
    }
  }

  const record = await airtableBase('Intérimaires').update([
    {
      id: recordId,
      fields: fieldsToUpdate,
    },
  ]);

  return record[0];
};

// Création d'une mission (MissionCreateScreen)
export const createMission = async (recruiterRecordId: string, missionData: any) => {
  const record = await airtableBase("Offres d'emploi").create([
    {
      fields: {
        title: missionData.title,
        description: missionData.description,
        startDate: missionData.startDate,
        endDate: missionData.endDate,
        dates: missionData.dates,
        location: missionData.location,
        rate: missionData.rate,
        shift: missionData.shift,
        skills: missionData.skills,
        status: missionData.status || 'open',
        recruiterId: [recruiterRecordId],
      },
    },
  ]);

  return record[0];
};

// Mise à jour d'une mission (MissionEditScreen)
export const updateMission = async (missionId: string, updateData: any) => {
  const record = await airtableBase("Offres d'emploi").update([
    {
      id: missionId,
      fields: {
        title: updateData.title,
        description: updateData.description,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        dates: updateData.dates,
        location: updateData.location,
        rate: updateData.rate,
        shift: updateData.shift,
        skills: updateData.skills,
        status: updateData.status,
      },
    },
  ]);

  return record[0];
};

// Création d'une candidature (JobDetailScreen)
export const createCandidature = async (candidateRecordId: string, missionRecordId: string) => {
  const record = await airtableBase('Candidatures').create([
    {
      fields: {
        interimaireId: [candidateRecordId],
        missionId: [missionRecordId],
        status: 'pending',
      },
    },
  ]);

  return record[0];
};