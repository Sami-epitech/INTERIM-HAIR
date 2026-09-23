/**
 * Représente une candidature déposée par un intérimaire sur une offre.
 */
export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  message: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  appliedAt: string;
}

