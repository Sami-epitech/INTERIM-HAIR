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

// Récupération profil intérimaire depuis Airtable
export const getInterimaireProfile = async (identifier: string) => {
  try {
    let candidateRecord: any = null;

    if (identifier.startsWith('rec')) {
      candidateRecord = await airtableBase('Intérimaires').find(identifier);
    } else {
      const records = await airtableBase('Intérimaires')
        .select({
          filterByFormula: `{email} = '${identifier.trim().toLowerCase()}'`,
          maxRecords: 1,
        })
        .firstPage();
      if (records.length > 0) {
        candidateRecord = records[0];
      }
    }

    if (!candidateRecord) {
      throw new Error(`Intérimaire introuvable pour l'identifiant ${identifier}`);
    }

    const f = candidateRecord.fields;
    const fullName = `${f.firstName || ''} ${f.lastName || ''}`.trim() || (f.name as string) || "Intérimaire";

    return {
      id: candidateRecord.id,
      firstName: f.firstName || "",
      lastName: f.lastName || "",
      fullName: fullName,
      name: fullName,
      email: f.email || "",
      phone: f.phone || "",
      bio: f.bio || "",
      diploma: f.diploma || "CAP Coiffure",
      title: (f.diploma as string) || "Coiffeur / Coiffeuse",
      skills: Array.isArray(f.skills) ? f.skills : ["CAP Coiffure"],
      experienceLevel: f.experienceLevel || "Confirmé",
      expectedRate: f.expectedRate || 15,
      locationCity: f.locationCity || "Paris",
      location: `${f.locationCity || 'Paris'}${f.locationRadiusKm ? `, ${f.locationRadiusKm} km` : ''}`,
      locationRadiusKm: f.locationRadiusKm || 25,
      availabilityDays: f.availabilityDays || ["Lun", "Mar", "Mer", "Jeu", "Ven"],
      availabilityFrom: f.availabilityFrom || "",
      availabilityTo: f.availabilityTo || "",
      availabilityStartHour: f.availabilityStartHour || "9h",
      availabilityEndHour: f.availabilityEndHour || "18h",
      favorites: f.favorites || [],
    };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur getInterimaireProfile(${identifier}) :`, error);
    throw error;
  }
};

// Récupération profil recruteur depuis Airtable
export const getRecruiterProfile = async (identifier: string) => {
  try {
    let recruiterRecord: any = null;

    if (identifier.startsWith('rec')) {
      recruiterRecord = await airtableBase('Recruteurs').find(identifier);
    } else {
      const records = await airtableBase('Recruteurs')
        .select({
          filterByFormula: `{email} = '${identifier.trim().toLowerCase()}'`,
          maxRecords: 1,
        })
        .firstPage();
      if (records.length > 0) {
        recruiterRecord = records[0];
      }
    }

    if (!recruiterRecord) {
      throw new Error(`Recruteur introuvable pour l'identifiant ${identifier}`);
    }

    const f = recruiterRecord.fields;
    const name = (f.name as string) || (f.salon as string) || "Salon Paris Éclat";

    return {
      id: recruiterRecord.id,
      email: f.email || "",
      name: name,
      salon: name,
    };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur getRecruiterProfile(${identifier}) :`, error);
    throw error;
  }
};

// Mise à jour profil intérimaire (ManualEntry, CVUpload, Onboarding2, CandidateDashboard)
export const updateInterimaire = async (recordId: string, profileData: any) => {
  let targetId = recordId;

  // Si recordId est un email au lieu d'un recID
  if (!targetId.startsWith('rec')) {
    const records = await airtableBase('Intérimaires')
      .select({
        filterByFormula: `{email} = '${recordId.trim().toLowerCase()}'`,
        maxRecords: 1,
      })
      .firstPage();
    if (records.length > 0) {
      targetId = records[0].id;
    }
  }

  const fieldsToUpdate: any = {};

  if (profileData.fullName) {
    const [first, ...rest] = profileData.fullName.trim().split(' ');
    fieldsToUpdate.firstName = first || profileData.fullName;
    if (rest.length > 0) fieldsToUpdate.lastName = rest.join(' ');
  } else if (profileData.name && !profileData.firstName) {
    const [first, ...rest] = profileData.name.trim().split(' ');
    fieldsToUpdate.firstName = first || profileData.name;
    if (rest.length > 0) fieldsToUpdate.lastName = rest.join(' ');
  }

  if (profileData.firstName) fieldsToUpdate.firstName = profileData.firstName;
  if (profileData.lastName) fieldsToUpdate.lastName = profileData.lastName;
  if (profileData.phone) fieldsToUpdate.phone = profileData.phone;
  if (profileData.bio) fieldsToUpdate.bio = profileData.bio;
  if (profileData.diploma) fieldsToUpdate.diploma = profileData.diploma;
  if (profileData.title && !profileData.diploma) fieldsToUpdate.diploma = profileData.title;
  if (profileData.skills) fieldsToUpdate.skills = profileData.skills;
  if (profileData.experienceLevel) fieldsToUpdate.experienceLevel = profileData.experienceLevel;
  if (profileData.expectedRate) fieldsToUpdate.expectedRate = Number(profileData.expectedRate);

  if (profileData.locationCity) fieldsToUpdate.locationCity = profileData.locationCity;
  if (profileData.city && !fieldsToUpdate.locationCity) fieldsToUpdate.locationCity = profileData.city;
  if (profileData.location && typeof profileData.location === 'string') {
    const cityMatch = profileData.location.split(',')[0].trim();
    if (cityMatch) fieldsToUpdate.locationCity = cityMatch;
  } else if (profileData.location && profileData.location.city) {
    fieldsToUpdate.locationCity = profileData.location.city;
    if (profileData.location.radiusKm) fieldsToUpdate.locationRadiusKm = Number(profileData.location.radiusKm);
  }
  if (profileData.locationRadiusKm) fieldsToUpdate.locationRadiusKm = Number(profileData.locationRadiusKm);

  if (profileData.availability) {
    if (profileData.availability.from) fieldsToUpdate.availabilityFrom = profileData.availability.from;
    if (profileData.availability.to) fieldsToUpdate.availabilityTo = profileData.availability.to;
    if (profileData.availability.days) fieldsToUpdate.availabilityDays = profileData.availability.days;
    if (profileData.availability.hours) {
      fieldsToUpdate.availabilityStartHour = profileData.availability.hours.start;
      fieldsToUpdate.availabilityEndHour = profileData.availability.hours.end;
    }
  }

  const record = await airtableBase('Intérimaires').update(
    [
      {
        id: targetId,
        fields: fieldsToUpdate,
      },
    ],
    { typecast: true }
  );

  return record[0];
};

// Création d'une mission (Recruteur)
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
        publishedAt: new Date().toISOString() 
      },
    },
  ]);

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
  let candidateData: any = null;
  let missionData: any = null;

  // Récupération des informations de l'intérimaire
  try {
    const candidate = await airtableBase('Intérimaires').find(candidateRecordId);
    candidateData = {
      id: candidate.id,
      firstName: candidate.fields.firstName,
      lastName: candidate.fields.lastName,
      email: candidate.fields.email,
      phone: candidate.fields.phone,
      diploma: candidate.fields.diploma,
      skills: candidate.fields.skills,
      experienceLevel: candidate.fields.experienceLevel,
      locationCity: candidate.fields.locationCity,
      expectedRate: candidate.fields.expectedRate,
    };
  } catch (e) {
    console.warn(`⚠️ [AIRTABLE] Intérimaire ${candidateRecordId} introuvable :`, e);
  }

  // Récupération des informations de la mission et du recruteur
  try {
    if (missionRecordId.startsWith('rec')) {
      const mission = await airtableBase("Offres d'emploi").find(missionRecordId);
      missionData = {
        id: mission.id,
        title: mission.fields.title,
        recruiterId: mission.fields.recruiterId || mission.fields.recruiterEmail,
        location: mission.fields.location,
      };
    }
  } catch (e) {
    console.warn(`⚠️ [AIRTABLE] Mission ${missionRecordId} introuvable :`, e);
  }

  // Enregistrement de la candidature dans la table "Candidatures" d'Airtable
  // On stocke le lien sous la forme `${missionRecordId}|${candidateRecordId}` dans le champ missionId
  const storedMissionField = candidateRecordId ? `${missionRecordId}|${candidateRecordId}` : String(missionRecordId);

  const record = await airtableBase('Candidatures').create(
    [
      {
        fields: {
          missionId: storedMissionField,
          status: 'pending',
        },
      },
    ],
    { typecast: true }
  );

  console.log(
    `📩 [CANDIDATURE AIRTABLE] Candidature créée (ID: ${record[0].id}) pour la mission "${missionData?.title || missionRecordId}" (Recruteur: ${missionData?.recruiterId || 'non spécifié'}) transmise pour l'intérimaire ${candidateData?.firstName || ''} ${candidateData?.lastName || ''} (${candidateData?.email || candidateRecordId})`
  );

  return {
    ...record[0],
    id: record[0].id,
    candidatureId: record[0].id,
    missionId: missionRecordId,
    candidateId: candidateRecordId,
    candidate: candidateData,
    mission: missionData,
  };
};

// Récupération des candidatures enrichies (pour candidat et recruteur)
export const getCandidaturesWithDetails = async (filters?: { candidateId?: string; recruiterEmail?: string; missionId?: string }) => {
  try {
    const rawCandidatures = await airtableBase('Candidatures').select().all();
    if (rawCandidatures.length === 0) return [];

    const candidateCache = new Map<string, any>();
    const missionCache = new Map<string, any>();

    const results = await Promise.all(
      rawCandidatures.map(async (rec: any) => {
        const rawMissionField = (rec.fields.missionId as string) || "";
        const parts = rawMissionField.split('|');
        const mId = parts[0];
        const cId = parts[1] || "";

        // Filtrage par missionId si demandé
        if (filters?.missionId && filters.missionId !== "all" && mId !== filters.missionId) {
          return null;
        }

        // Filtrage par candidateId si demandé
        if (filters?.candidateId && cId && cId !== filters.candidateId) {
          return null;
        }

        // Chargement mission
        let missionData: any = missionCache.get(mId);
        if (!missionData && mId) {
          if (mId.startsWith('rec')) {
            try {
              const mRec = await airtableBase("Offres d'emploi").find(mId);
              missionData = {
                id: mRec.id,
                title: (mRec.fields.title as string) || "Mission Coiffure",
                location: (mRec.fields.location as string) || "Paris",
                recruiterEmail: (mRec.fields.recruiterId as string) || (mRec.fields.recruiterEmail as string) || "",
                salon: (mRec.fields.salon as string) || "Salon Partenaire",
                rate: mRec.fields.rate || 16,
                dates: mRec.fields.dates || "Dates à convenir",
              };
              missionCache.set(mId, missionData);
            } catch (e) {}
          } else {
            missionData = {
              id: mId,
              title: `Mission ${mId}`,
              location: "France",
              recruiterEmail: "",
              salon: "Salon Partenaire",
              rate: 16,
              dates: "Dates à convenir",
            };
          }
        }

        // Filtrage par recruiterEmail si demandé
        if (filters?.recruiterEmail && missionData?.recruiterEmail) {
          if (missionData.recruiterEmail.toLowerCase() !== filters.recruiterEmail.toLowerCase()) {
            return null;
          }
        }

        // Chargement candidat
        let candidateData: any = null;
        const targetCandidateId = cId || filters?.candidateId;
        if (targetCandidateId) {
          candidateData = candidateCache.get(targetCandidateId);
          if (!candidateData && targetCandidateId.startsWith('rec')) {
            try {
              const cRec = await airtableBase('Intérimaires').find(targetCandidateId);
              candidateData = {
                id: cRec.id,
                name: `${cRec.fields.firstName || ''} ${cRec.fields.lastName || ''}`.trim() || (cRec.fields.name as string) || "Candidat",
                email: (cRec.fields.email as string) || "",
                phone: (cRec.fields.phone as string) || "",
                level: (cRec.fields.experienceLevel as string) || "Confirmé",
                skills: (cRec.fields.skills as string[]) || ["Coiffure"],
                diploma: (cRec.fields.diploma as string) || "CAP Coiffure",
                locationCity: (cRec.fields.locationCity as string) || "Paris",
              };
              candidateCache.set(targetCandidateId, candidateData);
            } catch (e) {}
          }
        }

        const candidateName = candidateData?.name || "Candidat Intérimaire";
        const initials = candidateName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "CI";

        return {
          id: rec.id,
          candidatureId: rec.id,
          missionId: mId,
          candidateId: cId || candidateData?.id || "",
          name: candidateName,
          candidateName: candidateName,
          candidateEmail: candidateData?.email || "",
          candidatePhone: candidateData?.phone || "",
          level: candidateData?.level || "Confirmé",
          initials: initials,
          skills: candidateData?.skills || ["Coiffure"],
          diploma: candidateData?.diploma || "CAP Coiffure",
          title: missionData?.title || "Mission",
          salon: missionData?.salon || "Salon Partenaire",
          location: missionData?.location || candidateData?.locationCity || "Paris",
          date: rec._rawJson?.createdTime
            ? new Date(rec._rawJson.createdTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
            : "Récemment",
          status: (rec.fields.status as string) || "pending",
          match: 88,
        };
      })
    );

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error("❌ [AIRTABLE] Erreur getCandidaturesWithDetails :", error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════
// 3. GESTION DES FAVORIS (Intérimaires <-> Offres d'emploi)
// ════════════════════════════════════════════════════════════

export const getInterimaireFavorites = async (candidateId: string) => {
  try {
    let candidateRecord: any = null;

    if (candidateId.startsWith('rec')) {
      candidateRecord = await airtableBase('Intérimaires').find(candidateId);
    } else {
      const records = await airtableBase('Intérimaires')
        .select({
          filterByFormula: `{email} = '${candidateId.trim().toLowerCase()}'`,
          maxRecords: 1,
        })
        .firstPage();
      if (records.length > 0) {
        candidateRecord = records[0];
      }
    }

    if (!candidateRecord) {
      return { favoriteIds: [], jobs: [] };
    }

    const favoriteIds: string[] = (candidateRecord.fields.favorites as string[]) || [];

    if (favoriteIds.length === 0) {
      return { favoriteIds: [], jobs: [] };
    }

    const allFavoriteIds = [...favoriteIds];

    // Récupération des offres correspondantes dans "Offres d'emploi"
    const jobs = await Promise.all(
      favoriteIds.map(async (offerId) => {
        try {
          const offerRecord = await airtableBase("Offres d'emploi").find(offerId);
          const rawTitle = (offerRecord.fields.title as string) || "Coiffeur / Coiffeuse";

          let displayTitle = rawTitle;
          let ftOfferId: string | null = null;
          const ftMatch = rawTitle.match(/\[FT:([^\]]+)\]\s*(.*)/);
          if (ftMatch) {
            ftOfferId = ftMatch[1].trim();
            displayTitle = ftMatch[2].trim() || rawTitle;
            if (!allFavoriteIds.includes(ftOfferId)) {
              allFavoriteIds.push(ftOfferId);
            }
          }

          return {
            id: ftOfferId || offerRecord.id,
            airtableId: offerRecord.id,
            ftOfferId: ftOfferId || undefined,
            title: displayTitle,
            description: (offerRecord.fields.description as string) || "Aucune description fournie.",
            startDate: offerRecord.fields.startDate,
            endDate: offerRecord.fields.endDate,
            dates: offerRecord.fields.dates || "Dates à convenir",
            location: (offerRecord.fields.location as string) || "France",
            rate: (offerRecord.fields.rate as number) || 16,
            shift: (offerRecord.fields.shift as string) || "35h / sem.",
            tags: (offerRecord.fields.skills as string[]) || ["Coiffure"],
            skills: (offerRecord.fields.skills as string[]) || ["Coiffure"],
            status: offerRecord.fields.status || "open",
            salon: (offerRecord.fields.salon as string) || "Salon Partenaire",
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
      favoriteIds: allFavoriteIds,
      jobs: validJobs,
    };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors de la récupération des favoris pour ${candidateId} :`, error);
    throw error;
  }
};

export const addInterimaireFavorite = async (candidateId: string, jobId: string, jobData?: any) => {
  try {
    let candidateRecord: any = null;

    if (candidateId.startsWith('rec')) {
      candidateRecord = await airtableBase('Intérimaires').find(candidateId);
    } else {
      const records = await airtableBase('Intérimaires')
        .select({
          filterByFormula: `{email} = '${candidateId.trim().toLowerCase()}'`,
          maxRecords: 1,
        })
        .firstPage();
      if (records.length > 0) {
        candidateRecord = records[0];
      }
    }

    if (!candidateRecord) {
      throw new Error(`Intérimaire introuvable : ${candidateId}`);
    }

    const currentFavorites: string[] = (candidateRecord.fields.favorites as string[]) || [];
    let targetJobId = jobId;

    // Si ce n'est pas un ID Airtable natif (ex: offre France Travail non encore présente dans la table)
    if (!targetJobId.startsWith('rec')) {
      // Recherche si l'offre FT existe déjà dans "Offres d'emploi" via son ID dans le titre
      const existing = await airtableBase("Offres d'emploi")
        .select({
          filterByFormula: `FIND('${jobId}', {title}) > 0`,
          maxRecords: 1,
        })
        .firstPage();

      if (existing.length > 0) {
        targetJobId = existing[0].id;
      } else {
        const titleToSave = `[FT:${jobId}] ${jobData?.title || 'Offre Coiffure'}`;
        const VALID_OFFRE_SKILLS = [
          'BP Coiffure',
          'Visagiste',
          'CAP Coiffure',
          'Balayage',
          'Mèches',
          'Kératine',
          'Coloriste',
          'Coupe Homme',
          'Rasage'
        ];

        const rawSkills: string[] = Array.isArray(jobData?.tags)
          ? jobData.tags
          : Array.isArray(jobData?.skills)
          ? jobData.skills
          : [];

        const filteredSkills = rawSkills.filter((s: string) => VALID_OFFRE_SKILLS.includes(s));
        const skillsToSave = filteredSkills.length > 0 ? filteredSkills : ['CAP Coiffure'];

        const created = await airtableBase("Offres d'emploi").create([
          {
            fields: {
              title: titleToSave,
              description: jobData?.description || "Offre importée France Travail",
              location: jobData?.location || "France",
              rate: Number(jobData?.rate) || 16,
              shift: "35h / sem.",
              status: "open",
              skills: skillsToSave,
            },
          },
        ]);
        targetJobId = created[0].id;
        console.log(`✅ [AIRTABLE] Offre France Travail ${jobId} enregistrée dans "Offres d'emploi" avec l'ID Airtable ${targetJobId}`);
      }
    }

    // Concaténation : ajout du nouvel ID Airtable aux favoris existants sans doublon
    if (currentFavorites.includes(targetJobId)) {
      const allIds = Array.from(new Set([...currentFavorites, jobId]));
      return { favoriteIds: allIds, addedId: targetJobId };
    }

    const newFavorites = [...currentFavorites, targetJobId];

    const updated = await airtableBase('Intérimaires').update(candidateRecord.id, {
      favorites: newFavorites,
    });

    const finalFavorites = (updated.fields.favorites as string[]) || [];
    const allIds = Array.from(new Set([...finalFavorites, jobId]));
    return { favoriteIds: allIds, addedId: targetJobId };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors de l'ajout du favori ${jobId} pour ${candidateId} :`, error);
    throw error;
  }
};

export const removeInterimaireFavorite = async (candidateId: string, jobId: string) => {
  try {
    let candidateRecord: any = null;

    if (candidateId.startsWith('rec')) {
      candidateRecord = await airtableBase('Intérimaires').find(candidateId);
    } else {
      const records = await airtableBase('Intérimaires')
        .select({
          filterByFormula: `{email} = '${candidateId.trim().toLowerCase()}'`,
          maxRecords: 1,
        })
        .firstPage();
      if (records.length > 0) {
        candidateRecord = records[0];
      }
    }

    if (!candidateRecord) {
      throw new Error(`Intérimaire introuvable : ${candidateId}`);
    }

    const currentFavorites: string[] = (candidateRecord.fields.favorites as string[]) || [];
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

    const updated = await airtableBase('Intérimaires').update(candidateRecord.id, {
      favorites: newFavorites,
    });

    const finalFavorites = (updated.fields.favorites as string[]) || [];
    return { favoriteIds: finalFavorites, removedId: targetJobId };
  } catch (error) {
    console.error(`❌ [AIRTABLE] Erreur lors du retrait du favori ${jobId} pour ${candidateId} :`, error);
    throw error;
  }
};