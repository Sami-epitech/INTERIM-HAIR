import { Request, Response } from 'express';
import { airtableBase as base } from '../config/airtable';
import { createMission, updateMission } from '../services/airtableService';
import fs from 'fs';
import path from 'path';

// Récupérer toutes les offres (France Travail + Airtable)
export const getJobs = async (req: Request, res: Response) => {
  try {
    // 1. Récupération des offres Airtable créées par les recruteurs
    const airtableRecords = await base("Offres d'emploi").select({ filterByFormula: "{status} = 'open'" }).firstPage();
    
    const airtableJobs = airtableRecords.map((record: any) => ({
      id: record.id,
      title: record.fields.title,
      description: record.fields.description,
      startDate: record.fields.startDate,
      endDate: record.fields.endDate,
      dates: record.fields.dates,
      location: record.fields.location,
      rate: record.fields.rate,
      shift: record.fields.shift,
      tags: record.fields.skills || [],
      status: record.fields.status,
      salon: "Salon Partenaire", // Valeur par défaut ou liée au recruteur
      contract: "Intérim",
      diplomas: ["CAP Coiffure"],
      benefits: ["Mutuelle", "primes"],
      match: 85, // Score fictif ou calculé par l'IA
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"
    }));

    // 2. Chargement optionnel des offres France Travail depuis ton fichier local (offres-ft.json)
    let ftJobs = [];
    const jsonPath = path.join(__dirname, '../offres-ft.json');
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, 'utf-8');
      ftJobs = JSON.parse(fileData);
    }

    // Fusion des deux tableaux pour le FeedScreen
    const allJobs = [...airtableJobs, ...ftJobs];

    return res.status(200).json(allJobs);
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur GET /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Créer une nouvelle mission (Recruteur)
export const postJob = async (req: Request, res: Response) => {
  try {
    const { recruiterId, ...missionData } = req.body;

    if (!missionData.title || !missionData.location || !missionData.rate) {
      return res.status(400).json({ message: "Champs obligatoires manquants (titre, localisation, taux horaire)." });
    }

    // ID par défaut du recruteur si non fourni dans la démo
    const targetRecruiterId = recruiterId || "rec_default_id";

    const newMission = await createMission(targetRecruiterId, missionData);

    return res.status(201).json({
      message: "Mission créée avec succès",
      mission: newMission,
    });
  } catch (error: any) {
    console.error("❌ [BACKEND] Erreur POST /api/jobs :", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};

// Mettre à jour une mission (MissionEditScreen)
export const patchJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await updateMission(id, updateData);

    return res.status(200).json({
      message: "Mission mise à jour avec succès",
      mission: updated,
    });
  } catch (error: any) {
    console.error(`❌ [BACKEND] Erreur PATCH /api/jobs/${req.params.id} :`, error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
};