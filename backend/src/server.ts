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

// 2. Routes Authentification
app.use("/api/auth", authRoutes);

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Le mot de passe est obligatoire." });
    }

    // Hachage sécurisé du mot de passe avec Argon2
    const passwordHash = await hashPassword(password);

    // Objet prêt pour la future table d'utilisateurs (sans JAMAIS stocker ni afficher password en clair)
    const newUser = {
      ...userData,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    console.log("📥 [BACKEND] Inscription traitée avec succès (mot de passe hashé avec Argon2) :");
    console.log("   Utilisateur :", { ...userData, passwordHash: `${passwordHash.substring(0, 25)}...` });

    // Réponse sécurisée : on ne renvoie ni le mot de passe, ni le hash au client
    return res.status(201).json({
      message: "Compte créé avec succès !",
      user: userData,
    });
  } catch (error) {
    console.error("❌ [BACKEND] Erreur lors du hashage/inscription :", error);
    return res.status(500).json({ error: "Erreur serveur lors de la création du compte." });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, userMode } = req.body;
  // Ne pas logger le mot de passe en clair
  console.log("📥 [BACKEND] Tentative de connexion reçue pour :", { email, userMode });
  res.status(200).json({ message: "Connexion réussie !", user: { email, userMode } });
});
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