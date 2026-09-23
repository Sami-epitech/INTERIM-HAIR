import { Application } from "../types/application.types";

const APPLICATIONS_DB: Application[] = [];

/**
 * Service gérant le cycle de vie des candidatures en mémoire.
 */
export class ApplicationService {
  /**
   * Crée et enregistre une nouvelle candidature.
   *
   * @param data - Données partielles de la candidature.
   * @returns La candidature créée.
   */
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
    console.log("[APPLICATION-SERVICE] Nouvelle candidature reçue :", newApplication);
    return newApplication;
  }

  /**
   * Récupère la liste de toutes les candidatures.
   */
  public getAllApplications(): Application[] {
    return APPLICATIONS_DB;
  }

  /**
   * Recherche une candidature par son identifiant.
   *
   * @param id - Identifiant de la candidature.
   */
  public getApplicationById(id: string): Application | undefined {
    return APPLICATIONS_DB.find((app) => app.id === id);
  }

  /**
   * Met à jour le statut d'une candidature.
   *
   * @param id - Identifiant de la candidature.
   * @param status - Nouveau statut de traitement.
   */
  public updateApplicationStatus(id: string, status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE"): Application | null {
    const application = this.getApplicationById(id);
    if (!application) {
      return null;
    }
    application.status = status;
    console.log(`[APPLICATION-SERVICE] Statut de la candidature ${id} mis à jour :`, status);
    return application;
  }
}

export const applicationService = new ApplicationService();

