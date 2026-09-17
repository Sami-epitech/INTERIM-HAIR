import { Router } from "express";
import { jobController } from "../controllers/job.controller";

const router = Router();

router.get("/", jobController.getAllJobs);

export default router;
