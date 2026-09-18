import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// GET /api/jobs
router.get("/", (_req, res) => {
  try {
    const filePath = path.join(__dirname, "../offres-ft.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Aucune offre trouvée. Lance le CLI d'ingestion." });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const jobs = JSON.parse(rawData);

    return res.json(jobs);
  } catch (error) {
    console.error("Erreur lors de la lecture des offres :", error);
    return res.status(500).json({ error: "Erreur serveur lors de la récupération des offres" });
  }
});

export default router;