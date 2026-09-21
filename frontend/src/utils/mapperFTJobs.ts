import type { Job } from "../types";

// Images de secours pour illustrer les cartes d'offres
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&auto=format"
];

export function mapFTToJob(ftOffer: any, index: number): Job {
  // Si l'offre provient d'Airtable (champs déjà structurés)
  if (ftOffer.title && ftOffer.salon) {
    return {
      id: ftOffer.id,
      title: ftOffer.title,
      salon: ftOffer.salon,
      location: ftOffer.location || "France",
      rate: ftOffer.rate || 16,
      shift: ftOffer.shift || "35h / sem.",
      contract: ftOffer.contract || "Intérim",
      match: ftOffer.match ?? 80,
      tags: ftOffer.tags && ftOffer.tags.length > 0 ? ftOffer.tags : ["Coiffure"],
      image: ftOffer.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
      description: ftOffer.description || "Aucune description fournie pour cette offre.",
      diplomas: ftOffer.diplomas || ["CAP Coiffure"],
      benefits: ftOffer.benefits || ["Mutuelle", "primes"],
      urlOrigine: ftOffer.urlOrigine,
    };
  }

  // Extrait les compétences ou génère des tags par défaut
  const tags = ftOffer.competences && ftOffer.competences.length > 0
    ? ftOffer.competences.slice(0, 3).map((c: any) => c.libelle)
    : ["Coiffure", "Savoir-faire", "Accueil"];

  // Récupération de l'URL d'origine France Travail
  const urlOrigine =
    ftOffer.origineOffre?.urlOrigine ||
    ftOffer.urlOrigine ||
    (ftOffer.id ? `https://candidat.francetravail.fr/offres/recherche/detail/${ftOffer.id}` : "https://candidat.francetravail.fr/offres/recherche");

  return {
    id: ftOffer.id,
    title: ftOffer.intitule || "Coiffeur / Coiffeuse",
    salon: ftOffer.entreprise?.nom || "Salon de Coiffure Partenaire",
    location: ftOffer.lieuTravail?.libelle || "France",
    rate: 16 + (index % 6), // Exemple d'estimation du taux horaire
    shift: "35h / sem.",
    contract: ftOffer.typeContratLibelle || "CDI",
    match: Math.floor(Math.random() * (98 - 75 + 1)) + 75, // Score de match simulé (75%-98%)
    tags: tags,
    image: DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
    description: ftOffer.description || "Aucune description fournie pour cette offre.",
    diplomas: ["CAP Coiffure (souhaité)"],
    benefits: ["Mutuelle", "Avantages entreprise"],
    urlOrigine: urlOrigine,
  };
}