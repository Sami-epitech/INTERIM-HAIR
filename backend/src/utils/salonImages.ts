// Liste d'images variées de salons et coiffure de haute qualité (Unsplash)
export const SALON_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop&auto=format", // Brushing & coiffure
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop&auto=format", // Barber & coupe homme
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&auto=format", // Coloration & bac de lavage
  "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&h=400&fit=crop&auto=format", // Salon design & contemporain
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=400&fit=crop&auto=format", // Coiffeuse en plein travail
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=400&fit=crop&auto=format", // Coupe & coiffage moderne
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=400&fit=crop&auto=format", // Coupe aux ciseaux professionnelle
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=400&fit=crop&auto=format", // Ambiance salon élégant
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=400&fit=crop&auto=format", // Salon miroirs & lumières chaudes
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=400&fit=crop&auto=format"  // Coupe stylisée
];

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
