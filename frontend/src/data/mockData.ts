// ════════════════════════════════════════════════════════════
// data/mockData.ts
// ────────────────────────────────────────────────────────────
// Données statiques utilisées tant que le backend n'est pas
// branché (voir backend/README.md → étape 6 "brancher le front").
// Quand l'API sera prête, ces constantes seront remplacées par
// des appels fetch()/hooks (ex. useEffect + fetch("/api/missions")),
// mais la FORME des données (les types de types.ts) doit rester
// la même pour limiter les changements dans les écrans.
// ════════════════════════════════════════════════════════════

import type { Job, Mission, Applicant, Application } from "../types";

/** Offres affichées dans le fil candidat (écran FeedScreen) */
export const JOBS: Job[] = [
  { id: 1, title: "Coiffeur Coloriste H/F", salon: "Salon Éclat Paris", location: "Paris 8e", rate: 18, shift: "9h – 18h", contract: "CDI", match: 94, tags: ["CAP Coiffure", "Coloriste", "Balayage"], image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&auto=format", description: "Rejoignez notre équipe au cœur du 8e arrondissement. Vous serez en charge des colorations, balayages et soins capillaires pour une clientèle haut de gamme, dans un salon réputé reconnu par Vogue Beauty.", diplomas: ["CAP Coiffure (obligatoire)", "BP Coiffure (souhaité)"], benefits: ["Tickets repas 9€/j", "Prime assiduité 150€/mois", "Navigo 50%", "Mutuelle premium"] },
  { id: 2, title: "Visagiste & Coloriste", salon: "Studio Marais Beauty", location: "Paris 4e", rate: 16, shift: "10h – 19h", contract: "Freelance", match: 81, tags: ["Visagisme", "Coloriste", "Mèches"], image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop&auto=format", description: "Studio indépendant au Marais recherche un·e visagiste et coloriste pour missions régulières. Clientèle créative, espace de travail inspirant, grande autonomie dans votre pratique artistique.", diplomas: ["CAP Coiffure", "Certificat Visagisme apprécié"], benefits: ["Flexibilité horaire totale", "Clientèle fidélisée", "Commission 15%"] },
  { id: 3, title: "Coiffeur Expert Hommes", salon: "Barber & Co Lyon", location: "Lyon 2e", rate: 15, shift: "8h – 17h", contract: "CDI", match: 73, tags: ["Coupe Homme", "Rasage", "Dégradé"], image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop&auto=format", description: "Barber & Co recrute un·e coiffeur·se spécialisé·e coupe homme pour renforcer son équipe lyonnaise. Ambiance moderne, clientèle masculine fidèle, outils professionnels fournis.", diplomas: ["CAP Coiffure (obligatoire)"], benefits: ["Primes performance", "Formation Wahl Academy", "Parking gratuit"] },
  { id: 4, title: "Coloriste Balayage Senior", salon: "L'Oréal Professionnel", location: "Paris 9e", rate: 22, shift: "9h – 18h", contract: "CDI", match: 88, tags: ["Coloriste", "Balayage", "BP Coiffure"], image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop&auto=format", description: "L'Oréal Professionnel recherche un·e coloriste senior expert·e en techniques balayage et ombré pour intégrer son salon flagship du 9e arrondissement.", diplomas: ["BP Coiffure", "Formation colorimétrie"], benefits: ["Salaire fixe + variable", "Formations L'Oréal", "CE avantageux", "Tickets repas"] },
];

/** Missions gérées côté recruteur (écran RecruiterDashboard) */
export const MISSIONS_INIT: Mission[] = [
  { id: 1, title: "Coloriste Senior", dates: "15 – 30 sept. 2026", sortDate: new Date("2026-09-15"), startDate: "2026-09-15", endDate: "2026-09-30", location: "Paris 8e – 12 rue du Faubourg St-Honoré", rate: 22, shift: "9h – 18h", description: "Nous recherchons un·e coloriste senior expérimenté·e pour renforcer notre équipe durant la Fashion Week. Maîtrise des techniques balayage, ombré et couleurs tendance exigée.", skills: ["Coloriste", "Balayage", "BP Coiffure"], count: 8, status: "open" },
  { id: 3, title: "Visagiste Weekend", dates: "20 sept. 2026", sortDate: new Date("2026-09-20"), startDate: "2026-09-20", endDate: "2026-09-21", location: "Paris 4e – 5 rue des Rosiers", rate: 16, shift: "10h – 19h", description: "Mission ponctuelle pour un shooting beauté le weekend. Profil créatif apprécié, portfolio requis.", skills: ["Visagisme", "Maquillage"], count: 3, status: "open" },
  { id: 4, title: "Coiffeur Homme CDI", dates: "Dès que possible", sortDate: new Date("2026-09-16"), startDate: "2026-09-16", endDate: "", location: "Lyon 2e – 8 place Bellecour", rate: 15, shift: "8h – 17h", description: "Recrutement urgent pour poste en CDI. Spécialisation coupe homme et rasage traditionnel.", skills: ["Coupe Homme", "Rasage", "Dégradé"], count: 6, status: "open" },
  { id: 2, title: "Coiffeur Balayage", dates: "1 – 15 oct. 2026", sortDate: new Date("2026-10-01"), startDate: "2026-10-01", endDate: "2026-10-15", location: "Paris 9e – 22 rue de la Paix", rate: 18, shift: "9h – 18h", description: "Mission longue durée pour couvrir un congé maternité. Expert·e balayage californien et mèches.", skills: ["Balayage", "CAP Coiffure"], count: 12, status: "filled" },
];

/** Candidat·e·s ayant postulé, groupé par mission via `missionId` (écran RecruiterDashboard, onglet "Candidat·e·s") */
export const ALL_APPLICANTS: Applicant[] = [
  { id: 1, missionId: 1, name: "Sofia Martinez", match: 94, level: "Expert", status: "shortlisted", initials: "SM", availFrom: "15 sept.", availTo: "30 sept." },
  { id: 2, missionId: 1, name: "Lucas Bernard", match: 87, level: "Confirmé", status: "pending", initials: "LB", availFrom: "15 sept.", availTo: "5 oct." },
  { id: 3, missionId: 1, name: "Emma Rousseau", match: 79, level: "Expert", status: "interview", initials: "ER", availFrom: "12 sept.", availTo: "30 sept." },
  { id: 4, missionId: 1, name: "Thomas Dubois", match: 71, level: "Débutant", status: "pending", initials: "TD", availFrom: "16 sept.", availTo: "30 sept." },
  { id: 5, missionId: 3, name: "Camille Perrin", match: 91, level: "Expert", status: "shortlisted", initials: "CP", availFrom: "20 sept.", availTo: "21 sept." },
  { id: 6, missionId: 3, name: "Julie Fontaine", match: 76, level: "Confirmé", status: "pending", initials: "JF", availFrom: "20 sept.", availTo: "21 sept." },
  { id: 7, missionId: 4, name: "Antoine Mercier", match: 88, level: "Expert", status: "interview", initials: "AM", availFrom: "Immédiate", availTo: "" },
  { id: 8, missionId: 4, name: "Marie Leclerc", match: 65, level: "Confirmé", status: "rejected", initials: "ML", availFrom: "1 oct.", availTo: "" },
  { id: 9, missionId: 2, name: "Léa Morel", match: 92, level: "Expert", status: "shortlisted", initials: "LM", availFrom: "1 oct.", availTo: "15 oct." },
  { id: 10, missionId: 2, name: "Pierre Garnier", match: 84, level: "Confirmé", status: "pending", initials: "PG", availFrom: "1 oct.", availTo: "15 oct." },
];

/** Candidatures envoyées par LE candidat connecté (écran CandidateDashboard, onglet "Candidatures") */
export const APPLICATIONS: Application[] = [
  { id: 1, title: "Coloriste Senior", salon: "L'Oréal Professionnel", date: "10 sept. 2026", status: "interview" },
  { id: 2, title: "Coiffeur Coloriste H/F", salon: "Salon Éclat Paris", date: "8 sept. 2026", status: "review" },
  { id: 3, title: "Visagiste Freelance", salon: "Studio Marais", date: "5 sept. 2026", status: "submitted" },
  { id: 4, title: "Coiffeur Expert Hommes", salon: "Barber & Co Lyon", date: "2 sept. 2026", status: "rejected" },
];

/** Offres mises en favori par le candidat connecté (écran CandidateDashboard, onglet "Favoris") */
export const FAVORITES_DATA: Job[] = [JOBS[0], JOBS[1]];

/** Référentiel de compétences (utilisé dans les filtres, l'onboarding, la création de mission...) */
export const SKILLS = ["CAP Coiffure", "BP Coiffure", "Coloriste", "Visagiste", "Balayage", "Mèches", "Kératine", "Coupe Homme", "Rasage", "Tresses"];

/** Jours de la semaine abrégés, utilisés dans les sélecteurs de disponibilité */
export const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Créneaux horaires proposés dans les <select> "Début" / "Fin" */
export const HOURS = ["7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h"];

/** Liste des diplômes proposés à l'inscription / lors de la relecture du CV importé */
export const DIPLOMAS_LIST = ["CAP Coiffure", "BP Coiffure", "BM Coiffure", "Bac Pro Coiffure", "Certificat Visagisme", "Formation Colorimétrie", "Autre"];
