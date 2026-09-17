export interface OffreFranceTravail {
  id: string;
  intitule: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  typeContratLibelle?: string;
  salaire?: { libelle?: string };
  description?: string;
  competences?: Array<{ libelle: string }>;
  dateCreation?: string;
}

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