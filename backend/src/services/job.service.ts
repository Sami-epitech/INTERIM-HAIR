import { OffreFranceTravail } from "../types/job.types";
import { transformerOffreFranceTravail } from "../mapper";

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

export class JobService {
  public getAllJobs() {
    return MOCK_OFFRES_FT.map(transformerOffreFranceTravail);
  }
}

export const jobService = new JobService();
