import { Application } from "../types/application.types";

const APPLICATIONS_DB: Application[] = [];

export class ApplicationService {
  public createApplication(data: Partial<Application>): Application {
    const newApplication: Application = {
      id: `APP-${Date.now()}`,
      jobId: String(data.jobId),
      candidateName: data.candidateName || "Candidat Anonyme",
      candidateEmail: data.candidateEmail || "candidat@example.com",
      message: data.message || "Candidature envoyée depuis Interim'hair",
      status: "EN_ATTENTE",
      appliedAt: new Date().toISOString(),
    };

    APPLICATIONS_DB.push(newApplication);
    console.log("[TK-009] Nouvelle candidature reçue :", newApplication);
    return newApplication;
  }

  public getAllApplications(): Application[] {
    return APPLICATIONS_DB;
  }

  public getApplicationById(id: string): Application | undefined {
    return APPLICATIONS_DB.find((app) => app.id === id);
  }

  public updateApplicationStatus(id: string, status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE"): Application | null {
    const application = this.getApplicationById(id);
    if (!application) {
      return null;
    }
    application.status = status;
    console.log(`[TK-009] Statut de la candidature ${id} mis à jour :`, status);
    return application;
  }
}

export const applicationService = new ApplicationService();
