import path from "path";
import dotenv from "dotenv";

// ════════════════════════════════════════════════════════════
// IMPORTANT MAC : Cette directive est strictement nécessaire pour permettre
// aux développeurs sur macOS d'exécuter le projet sans blocage de certificats TLS locaux.
// ════════════════════════════════════════════════════════════
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Charge le .env à la racine du projet puis l'éventuel .env dans backend/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import passport from "./auth/passport";

// Import de nos vrais contrôleurs connectés à Airtable
import { signup, login } from "./controllers/auth.controller";
import { saveProfile, getProfile } from "./controllers/profile.controller";
import { getJobs, postJob, patchJob } from "./controllers/job.controller";
import { applyToMission, getApplications } from "./controllers/application.controller";
import { getFavorites, addFavorite, removeFavorite, toggleFavorite } from "./controllers/favorite.controller";
import { uploadDocument, downloadDocument, getCandidateDocuments } from "./controllers/document.controller";

// Import de tes routeurs modulaires existants (si tu veux les garder)
import jobRoutes from "./routes/job.routes";
import authRoutes from "./routes/auth.routes";
import { hashPassword } from "./auth/hashing";

const app = express();
const PORT = process.env.PORT || 8000;

// 🔒 Sécurité en transit (Headers HTTP stricts : HSTS, anti-sniffing, anti-clickjacking)
app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(cors());
app.use(express.json({ limit: "15mb" })); // Supporte l'upload base64 de documents/CVs
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
app.get("/api/profile", getProfile);
app.get("/api/users/me", getProfile);
app.post("/api/profile", saveProfile);
app.put("/api/profile", saveProfile);

// 4. Routes pour la gestion des Missions / Jobs (Connectées à Airtable via job.controller.ts)
app.get("/api/jobs", getJobs);
app.post("/api/jobs", postJob);
app.patch("/api/jobs/:id", patchJob);

// 5. Routes pour les candidatures (Connectées à Airtable via application.controller.ts)
app.get("/api/applications", getApplications);
app.get("/api/missions/:missionId/applications", getApplications);
app.post("/api/missions/:missionId/applications", applyToMission);
app.post("/api/jobs/:missionId/applications", applyToMission);

// 6. Routes pour les favoris (Connectées à Airtable via favorite.controller.ts)
app.get("/api/favorites", getFavorites);
app.get("/api/users/me/favorites", getFavorites);
app.post("/api/favorites", addFavorite);
app.post("/api/users/me/favorites", addFavorite);
app.delete("/api/favorites/:jobId", removeFavorite);
app.delete("/api/favorites", removeFavorite);
app.post("/api/favorites/toggle", toggleFavorite);

// 7. Routes Documents & CVs sécurisés (Chiffrement au repos AES-256-GCM)
app.post("/api/documents/upload", uploadDocument);
app.get("/api/documents/:docId", downloadDocument);
app.get("/api/documents/candidate/:candidateId", getCandidateDocuments);

// Routes modulaires additionnelles
app.use("/api/jobs", jobRoutes);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interimhair";

// Démarrage du serveur Express
app.listen(PORT, () => {
  console.log(`🚀 [OK] Serveur Node/TypeScript démarré sur http://localhost:${PORT}`);
});

// Connexion optionnelle à MongoDB (sans bloquer le serveur si MongoDB n'est pas démarré)
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ [MONGODB] Connecté avec succès à la base NoSQL !");
  })
  .catch((err) => {
    console.warn("⚠️ [MONGODB] Base NoSQL non disponible (démarrez Docker ou ignorez si non utilisé) :", err.message);
  });