export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  message: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  appliedAt: string;
}
