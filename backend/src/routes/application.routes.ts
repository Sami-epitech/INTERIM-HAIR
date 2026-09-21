import { Router } from "express";
import { applyToMission } from "../controllers/application.controller";

const router = Router();

router.post("/:missionId", applyToMission);

export default router;
