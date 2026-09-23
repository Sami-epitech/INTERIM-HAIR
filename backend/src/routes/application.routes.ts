/**
 * Routes de gestion des candidatures.
 */
import { Router } from "express";
import { applyToMission } from "../controllers/application.controller";

const router = Router();

// Enregistrement d'une candidature pour une mission
router.post("/:missionId", applyToMission);

export default router;
