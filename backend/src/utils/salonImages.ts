/**
 * Collection d'illustrations de salons de coiffure sélectionnées pour la présentation visuelle.
 */
export const SALON_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop&auto=format", // Brushing et coiffure
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop&auto=format", // Barbier et coupe homme
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&auto=format", // Coloration et bac de lavage
  "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&h=400&fit=crop&auto=format", // Salon design contemporain
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&auto=format", // Poste de travail salon
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=400&fit=crop&auto=format", // Coupe et coiffage moderne
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=400&fit=crop&auto=format", // Coupe aux ciseaux professionnelle
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=400&fit=crop&auto=format", // Ambiance salon élégant
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=400&fit=crop&auto=format", // Salon miroirs et éclairage chaleureux
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=400&fit=crop&auto=format"  // Coupe stylisée
];

/**
 * Retourne une image de salon associée à une offre de façon déterministe ou utilise l'image personnalisée fournie.
 *
 * @param id - Identifiant de l'offre pour le calcul de dispersion.
 * @param customImage - URL ou objet d'image personnalisé éventuel.
 * @returns URL de l'image sélectionnée.
 */
export function getSalonImage(id: string | number, customImage?: any): string {
  if (typeof customImage === 'string' && customImage.trim() && !customImage.includes('photo-1560066984-138dadb4c035')) {
    return customImage;
  }
  if (Array.isArray(customImage) && customImage[0]?.url) {
    return customImage[0].url;
  }
  const str = String(id || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return SALON_IMAGES[hash % SALON_IMAGES.length];
}
