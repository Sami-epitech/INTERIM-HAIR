import { OffreFranceTravail } from "./types/job.types";

/**
 * Transforme une offre brute issue de l'API France Travail
 * au format standardisé consommé par le frontend Interim'hair.
 *
 * @param offre Objet offre brut de France Travail
 * @returns Offre formatée conforme au modèle de l'application
 */
export function transformerOffreFranceTravail(offre: OffreFranceTravail) {
  return {
    id: offre.id,
    title: offre.intitule || "Offre sans titre",
    salonName: offre.entreprise?.nom || "Salon non renseigné",
    location: offre.lieuTravail?.libelle || "Lieu non renseigné",
    contractType: offre.typeContratLibelle || "Intérim",
    hourlyRate: offre.salaire?.libelle || "Non précisé",
    description: offre.description || "Aucune description",
    requirements: offre.competences?.map((c) => c.libelle) || [],
    datePosted: offre.dateCreation ? offre.dateCreation.split("T")[0] : new Date().toISOString().split("T")[0],
    diplomas: ["CAP Coiffure"],
    benefits: ["Titre-restaurant", "Mutuelle"],
  };
}