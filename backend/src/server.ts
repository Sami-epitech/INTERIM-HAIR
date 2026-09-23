import path from "path";
import dotenv from "dotenv";

/**
 * Désactivation temporaire de la vérification stricte des certificats TLS
 * pour permettre l'exécution en environnement de développement local.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Chargement des variables d'environnement (.env racine puis backend/.env)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import passport from "./auth/passport";

// Contrôleurs métiers connectés aux services Airtable et MongoDB
import { signup, login } from "./controllers/auth.controller";
import { saveProfile, getProfile } from "./controllers/profile.controller";
import { getJobs, postJob, patchJob } from "./controllers/job.controller";
import { applyToMission, getApplications } from "./controllers/application.controller";
import { getFavorites, addFavorite, removeFavorite, toggleFavorite } from "./controllers/favorite.controller";
import { uploadDocument, downloadDocument, getCandidateDocuments } from "./controllers/document.controller";

// Routeurs modulaires
import jobRoutes from "./routes/job.routes";
import authRoutes from "./routes/auth.routes";
import { runJobIngestionCLI } from "./services/jobSync";

const app = express();
const PORT = process.env.PORT || 8000;

// En-têtes de sécurité HTTP stricts (HSTS, protection contre le détournement de clics et sniffing MIME)
app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(cors());
app.use(express.json({ limit: "15mb" })); // Autorise la charge utile pour l'envoi de documents en base64
app.use(passport.initialize());

// Route de diagnostic
app.get("/", (_req, res) => {
  res.json({ message: "Bienvenue sur l'API Interim'hair" });
});

// Authentification OAuth (Google / Facebook) et locale (Airtable)
app.use("/api/auth", authRoutes);
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);

// Profils utilisateurs et disponibilités
app.get("/api/profile", getProfile);
app.get("/api/users/me", getProfile);
app.post("/api/profile", saveProfile);
app.put("/api/profile", saveProfile);

// Gestion des offres d'emploi et missions
app.get("/api/jobs", getJobs);
app.post("/api/jobs", postJob);
app.patch("/api/jobs/:id", patchJob);

// Candidatures
app.get("/api/applications", getApplications);
app.get("/api/missions/:missionId/applications", getApplications);
app.post("/api/missions/:missionId/applications", applyToMission);
app.post("/api/jobs/:missionId/applications", applyToMission);

// Favoris des intérimaires
app.get("/api/favorites", getFavorites);
app.get("/api/users/me/favorites", getFavorites);
app.post("/api/favorites", addFavorite);
app.post("/api/users/me/favorites", addFavorite);
app.delete("/api/favorites/:jobId", removeFavorite);
app.delete("/api/favorites", removeFavorite);
app.post("/api/favorites/toggle", toggleFavorite);

// Gestion sécurisée des documents (chiffrement au repos AES-256-GCM)
app.post("/api/documents/upload", uploadDocument);
app.get("/api/documents/:docId", downloadDocument);
app.get("/api/documents/candidate/:candidateId", getCandidateDocuments);

// Routes modulaires d'offres
app.use("/api/jobs", jobRoutes);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interimhair";

// Initialisation du serveur HTTP
app.listen(PORT, () => {
  console.log(`[OK] Serveur démarré sur http://localhost:${PORT}`);

  // Synchronisation périodique des offres France Travail
  runJobIngestionCLI();

  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(() => {
    runJobIngestionCLI();
  }, TWELVE_HOURS);
});

// Connexion facultative à MongoDB (le serveur reste opérationnel si indisponible)
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("[MONGODB] Connecté avec succès à la base NoSQL");
  })
  .catch((err) => {
    console.warn("[MONGODB] Base NoSQL non disponible :", err.message);
  });