import { Request, Response } from "express";
import { jobService } from "../services/job.service";

export class JobController {
  public getAllJobs = (_req: Request, res: Response) => {
    try {
      const offresFormatees = jobService.getAllJobs();
      res.json(offresFormatees);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du traitement des offres" });
    }
  };
}

export const jobController = new JobController();
