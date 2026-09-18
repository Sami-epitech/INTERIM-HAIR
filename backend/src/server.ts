import path from "path";
import dotenv from "dotenv";

// Charge le .env à la racine du projet puis l'éventuel .env dans backend/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import passport from "./auth/passport";

// Import de nos vrais contrôleurs connectés à Airtable
import { signup, login } from "./controllers/auth.controller";
import { saveProfile } from "./controllers/profile.controller";
import { getJobs, postJob, patchJob } from "./controllers/job.controller";
import { applyToMission } from "./controllers/application.controller";

// Import de tes routeurs modulaires existants (si tu veux les garder)
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import authRoutes from "./routes/auth.routes";
import { hashPassword } from "./auth/hashing";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// 1. Route racine
app.get("/", (_req, res) => {
  res.json({ message: "Bienvenue sur l'API Interim'hair" });
});

// 2. Routes Authentification OAuth (Google / Facebook)
app.use("/api/auth", authRoutes);
// 2. Routes Authentification (Connectées à Airtable via auth.controller.ts)
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);

// 3. Route Profil & Disponibilités (Connectée à Airtable via profile.controller.ts)
app.post("/api/profile", saveProfile);

// 4. Routes pour la gestion des Missions / Jobs (Connectées à Airtable via job.controller.ts)
app.get("/api/jobs", getJobs);
app.post("/api/jobs", postJob);
app.patch("/api/jobs/:id", patchJob);

// 5. Routes pour les candidatures (Connectées à Airtable via application.controller.ts)
app.post("/api/missions/:missionId/applications", applyToMission);

// Routes modulaires additionnelles
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.listen(PORT, () => {
  console.log(`[OK] Serveur Node/TypeScript démarré sur http://localhost:${PORT}`);
});