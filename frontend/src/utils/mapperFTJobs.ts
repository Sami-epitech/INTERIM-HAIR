import type { Job } from "../types";

// Images de secours pour illustrer les cartes d'offres (salons de coiffure modernes, stylistes, coloration, barber)
export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop&auto=format", // Brushing & coiffure
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop&auto=format", // Barber & coupe homme
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&auto=format", // Coloration & soins capillaires
  "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&h=400&fit=crop&auto=format", // Salon design & contemporain
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&auto=format", // Coiffeuse en plein travail
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=400&fit=crop&auto=format", // Coupe & coiffage moderne
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=400&fit=crop&auto=format", // Coupe aux ciseaux professionnelle
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=400&fit=crop&auto=format", // Ambiance salon élégant
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=400&fit=crop&auto=format", // Salon miroirs & lumières chaudes
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=400&fit=crop&auto=format"  // Coupe stylisée
];

/**
 * Retourne une image appropriée pour l'offre.
 * Si l'image fournie est vide ou correspond à l'ancienne photo noir & blanc,
 * elle attribue de manière déterministe l'une des images de la liste selon l'ID ou l'index.
 */
export function getJobImage(idOrIndex: string | number, customImage?: string): string {
  if (customImage && !customImage.includes("photo-1560066984-138dadb4c035")) {
    return customImage;
  }
  const str = String(idOrIndex);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
}

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
      image: getJobImage(ftOffer.id || index, ftOffer.image),
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
    image: getJobImage(ftOffer.id || index, ftOffer.image),
    description: ftOffer.description || "Aucune description fournie pour cette offre.",
    diplomas: ["CAP Coiffure (souhaité)"],
    benefits: ["Mutuelle", "Avantages entreprise"],
    urlOrigine: urlOrigine,
  };
}