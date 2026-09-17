import { Request, Response } from "express";
import { applicationService } from "../services/application.service";

export class ApplicationController {
  public createApplication = (req: Request, res: Response) => {
    try {
      const { jobId, candidateName, candidateEmail, message } = req.body;

      if (!jobId) {
        return res.status(400).json({ error: "L'ID de l'offre est obligatoire" });
      }

      const newApplication = applicationService.createApplication({
        jobId,
        candidateName,
        candidateEmail,
        message,
      });

      return res.status(201).json({
        message: "Candidature enregistrée avec succès",
        application: newApplication,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erreur lors de l'enregistrement de la candidature" });
    }
  };

  public getAllApplications = (_req: Request, res: Response) => {
    res.json(applicationService.getAllApplications());
  };

  public updateApplicationStatus = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Le statut est obligatoire" });
      }

      const application = applicationService.updateApplicationStatus(id, status);

      if (!application) {
        return res.status(404).json({ error: "Candidature non trouvée" });
      }

      return res.json({
        message: "Statut mis à jour avec succès",
        application,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
    }
  };
}

export const applicationController = new ApplicationController();
