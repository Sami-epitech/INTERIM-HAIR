import { Router } from "express";
import { applicationController } from "../controllers/application.controller";

const router = Router();

router.post("/", applicationController.createApplication);
router.get("/", applicationController.getAllApplications);
router.patch("/:id", applicationController.updateApplicationStatus);

export default router;
