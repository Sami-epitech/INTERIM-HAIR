import express, { Request, Response } from "express";
import cors from "cors";
import { transformerOffreFranceTravail, OffreFranceTravail } from "./mapper";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Type local pour les candidatures
interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  message: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  appliedAt: string;
}

const APPLICATIONS_DB: Application[] = [];

const MOCK_OFFRES_FT: OffreFranceTravail[] = [
  {
    id: "184XYZ1",
    intitule: "Coiffeur / Coiffeuse Polyvalent(e)",
    entreprise: { nom: "Salon Tiff & Co" },
    lieuTravail: { libelle: "Lille - 59" },
    typeContratLibelle: "Intérim - 3 mois",
    salaire: { libelle: "13.50 € par heure" },
    description: "Nous recherchons un coiffeur autonome pour renforcer notre équipe...",
    competences: [{ libelle: "Coupe homme" }, { libelle: "Coloration" }, { libelle: "Balayage" }],
    dateCreation: "2026-09-16T08:00:00.000Z",
  },
  {
    id: "184XYZ2",
    intitule: "Coiffeur Visagiste / Coloriste",
    entreprise: { nom: "L'Atelier Coiffure" },
    lieuTravail: { libelle: "Paris 15e - 75" },
    typeContratLibelle: "CDD",
    salaire: { libelle: "14.00 € par heure" },
    description: "Salon haut de gamme cherche un profil expérimenté en technique et visagisme...",
    competences: [{ libelle: "Visagisme" }, { libelle: "Technique coloration" }],
    dateCreation: "2026-09-15T14:30:00.000Z",
  },
  {
    id: "184XYZ3",
    intitule: "Barbier / Coiffeur Homme",
    entreprise: { nom: "Barber Shop Club" },
    lieuTravail: { libelle: "Lyon 2e - 69" },
    typeContratLibelle: "MIS (Intérim)",
    salaire: { libelle: "12.80 € par heure" },
    description: "Recherche spécialiste de la taille de barbe et coupe homme moderne...",
    competences: [{ libelle: "Taille de barbe" }, { libelle: "Coupe homme" }],
    dateCreation: "2026-09-14T09:15:00.000Z",
  },
];

// Routes
app.get("/api/jobs", (_req: Request, res: Response) => {
  try {
    const offresFormatees = MOCK_OFFRES_FT.map(transformerOffreFranceTravail);
    res.json(offresFormatees);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du traitement des offres" });
  }
});

app.post("/api/applications", (req: Request, res: Response) => {
  try {
    const { jobId, candidateName, candidateEmail, message } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: "L'ID de l'offre est obligatoire" });
    }

    const newApplication: Application = {
      id: `APP-${Date.now()}`,
      jobId: String(jobId),
      candidateName: candidateName || "Candidat Anonyme",
      candidateEmail: candidateEmail || "candidat@example.com",
      message: message || "Candidature envoyée depuis Interim'hair",
      status: "EN_ATTENTE",
      appliedAt: new Date().toISOString(),
    };

    APPLICATIONS_DB.push(newApplication);
    console.log("[TK-009] Nouvelle candidature reçue :", newApplication);

    return res.status(201).json({
      message: "Candidature enregistrée avec succès",
      application: newApplication,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de l'enregistrement de la candidature" });
  }
});

app.get("/api/applications", (_req: Request, res: Response) => {
  res.json(APPLICATIONS_DB);
});

app.patch("/api/applications/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = APPLICATIONS_DB.find((app) => app.id === id);

    if (!application) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    if (!status) {
      return res.status(400).json({ error: "Le statut est obligatoire" });
    }

    application.status = status;
    console.log(`[TK-009] Statut de la candidature ${id} mis à jour :`, status);

    return res.json({
      message: "Statut mis à jour avec succès",
      application,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
  }
});

app.listen(PORT, () => {
  console.log(`[OK] Serveur Node/TypeScript démarré sur http://localhost:${PORT}`);
});