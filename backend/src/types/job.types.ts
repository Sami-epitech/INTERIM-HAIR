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
