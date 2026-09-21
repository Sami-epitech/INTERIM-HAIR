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
  
  const record = await airtableBase(tableName).create(
    [
      {
        fields: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      },
    ],
    { typecast: true }
  );
  
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

  const record = await airtableBase('Intérimaires').update(
    [
      {
        id: recordId,
        fields: fieldsToUpdate,
      },
    ],
    { typecast: true }
  );

  return record[0];
};

// Création d'une mission (MissionCreateScreen)
export const createMission = async (recruiterRecordId: string, missionData: any) => {
  const fields: any = {
    title: missionData.title,
    description: missionData.description,
    startDate: missionData.startDate,
    endDate: missionData.endDate,
    dates: missionData.dates,
    location: missionData.location,
    rate: Number(missionData.rate),
    shift: missionData.shift,
    skills: missionData.skills,
    status: missionData.status || 'open',
  };

  if (recruiterRecordId && recruiterRecordId !== "rec_default_id") {
    fields.recruiterId = [recruiterRecordId];
  }

  const record = await airtableBase("Offres d'emploi").create(
    [
      {
        fields,
      },
    ],
    { typecast: true }
  );

  return record[0];
};

// Mise à jour d'une mission (MissionEditScreen)
export const updateMission = async (missionId: string, updateData: any) => {
  const record = await airtableBase("Offres d'emploi").update(
    [
      {
        id: missionId,
        fields: {
          title: updateData.title,
          description: updateData.description,
          startDate: updateData.startDate,
          endDate: updateData.endDate,
          dates: updateData.dates,
          location: updateData.location,
          rate: Number(updateData.rate),
          shift: updateData.shift,
          skills: updateData.skills,
          status: updateData.status,
        },
      },
    ],
    { typecast: true }
  );

  return record[0];
};

// Création d'une candidature (JobDetailScreen)
export const createCandidature = async (candidateRecordId: string, missionRecordId: string) => {
  const record = await airtableBase('Candidatures').create(
    [
      {
        fields: {
          interimaireId: [candidateRecordId],
          missionId: [missionRecordId],
          status: 'pending',
        },
      },
    ],
    { typecast: true }
  );

  return record[0];
};

// ════════════════════════════════════════════════════════════
// 3. GESTION DES FAVORIS (Intérimaires <-> Offres d'emploi)
// ════════════════════════════════════════════════════════════

export const getInterimaireFavorites = async (candidateId: string) => {
  try {
    const candidate = await airtableBase('Intérimaires').find(candidateId);
    const favoriteIds: string[] = (candidate.fields.favorites as string[]) || [];

    if (favoriteIds.length === 0) {
      return { favoriteIds: [], jobs: [] };
    }

    // Récupération des offres correspondantes dans "Offres d'emploi"
    const jobs = await Promise.all(
      favoriteIds.map(async (offerId) => {
        try {
          const offerRecord = await airtableBase("Offres d'emploi").find(offerId);
          return {
            id: offerRecord.id,
            title: (offerRecord.fields.title as string) || "Coiffeur / Coiffeuse",
            description: (offerRecord.fields.description as string) || "Aucune description fournie.",
            startDate: offerRecord.fields.startDate,
            endDate: offerRecord.fields.endDate,
            dates: offerRecord.fields.dates,
            location: (offerRecord.fields.location as string) || "France",
            rate: (offerRecord.fields.rate as number) || 16,
            shift: (offerRecord.fields.shift as string) || "35h / sem.",
            tags: (offerRecord.fields.skills as string[]) || ["Coiffure"],
            status: offerRecord.fields.status,
            salon: "Salon Partenaire",
            contract: "Intérim",
            diplomas: ["CAP Coiffure"],
            benefits: ["Mutuelle", "primes"],
            match: 85,
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
          };
        } catch (e) {
          console.warn(`⚠️ [AIRTABLE] Offre favorite ${offerId} introuvable dans Offres d'emploi.`);
          return null;
        }
      })
    );

    const validJobs = jobs.filter((j): j is NonNullable<typeof j> => j !== null);
    return {
      favoriteIds,
      jobs: validJobs,
    };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors de la récupération des favoris pour ${candidateId} :`, error);
    throw error;
  }
};

export const addInterimaireFavorite = async (candidateId: string, jobId: string, jobData?: any) => {
  try {
    const candidate = await airtableBase('Intérimaires').find(candidateId);
    const currentFavorites: string[] = (candidate.fields.favorites as string[]) || [];

    let targetJobId = jobId;

    // Si ce n'est pas un ID Airtable natif (ex: offre France Travail non encore présente dans la table)
    if (!targetJobId.startsWith('rec')) {
      const cleanTitle = (jobData?.title || targetJobId).replace(/'/g, "\\'");
      const existing = await airtableBase("Offres d'emploi")
        .select({
          filterByFormula: `{title} = '${cleanTitle}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (existing.length > 0) {
        targetJobId = existing[0].id;
      } else {
        const created = await airtableBase("Offres d'emploi").create([
          {
            fields: {
              title: jobData?.title || `Offre ${jobId}`,
              description: jobData?.description || "Offre importée",
              location: jobData?.location || "France",
              rate: jobData?.rate || 16,
              shift: jobData?.shift || "35h / sem.",
              status: "open",
              skills: jobData?.tags || [],
            },
          },
        ]);
        targetJobId = created[0].id;
      }
    }

    // Concaténation : ajout du nouvel ID aux favoris existants sans doublon
    if (currentFavorites.includes(targetJobId)) {
      return { favoriteIds: currentFavorites, addedId: targetJobId };
    }

    const newFavorites = [...currentFavorites, targetJobId];

    const updated = await airtableBase('Intérimaires').update(candidateId, {
      favorites: newFavorites,
    });

    const finalFavorites = (updated.fields.favorites as string[]) || [];
    return { favoriteIds: finalFavorites, addedId: targetJobId };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors de l'ajout du favori ${jobId} pour ${candidateId} :`, error);
    throw error;
  }
};

export const removeInterimaireFavorite = async (candidateId: string, jobId: string) => {
  try {
    const candidate = await airtableBase('Intérimaires').find(candidateId);
    const currentFavorites: string[] = (candidate.fields.favorites as string[]) || [];

    let targetJobId = jobId;

    if (!targetJobId.startsWith('rec')) {
      for (const favId of currentFavorites) {
        try {
          const offer = await airtableBase("Offres d'emploi").find(favId);
          if (offer.fields.title && offer.fields.title.toString().includes(jobId)) {
            targetJobId = favId;
            break;
          }
        } catch (e) {}
      }
    }

    // Retrait : exclusion de l'offre
    const newFavorites = currentFavorites.filter((id) => id !== targetJobId && id !== jobId);

    const updated = await airtableBase('Intérimaires').update(candidateId, {
      favorites: newFavorites,
    });

    const finalFavorites = (updated.fields.favorites as string[]) || [];
    return { favoriteIds: finalFavorites, removedId: targetJobId };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors du retrait du favori ${jobId} pour ${candidateId} :`, error);
    throw error;
  }
};