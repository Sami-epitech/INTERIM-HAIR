import path from "path";
import dotenv from "dotenv";

// Charge le .env à la racine du projet puis l'éventuel .env dans backend/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import passport from "./auth/passport";
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

// 3. Route Profil & Disponibilités
app.post("/api/profile", (req, res) => {
  const data = req.body;
  console.log("\n==================================================");
  console.log("📥 [BACKEND] Profil / Préférences reçus !");
  console.log("--------------------------------------------------");
  console.log(" Source            :", data.source || "Non précisée");
  if (data.skills) console.log(" Compétences       :", data.skills.join(", "));
  if (data.experienceLevel) console.log(" Expérience        :", data.experienceLevel);
  if (data.location) console.log(" Zone de travail   :", `${data.location.city} (${data.location.radiusKm} km)`);
  if (data.availability) {
    console.log(" 🗓️  Période du     :", data.availability.from, "au", data.availability.to);
    console.log(" 📅 Jours de travail :", data.availability.days ? data.availability.days.join(", ") : "Aucun");
    if (data.availability.hours) {
      console.log(" ⏰ Plage horaire   :", `${data.availability.hours.start} – ${data.availability.hours.end}`);
    }
  }
  console.log("==================================================\n");

  res.status(200).json({ message: "Profil enregistré avec succès !", profile: data });
});

// 4. Routes pour la gestion des Missions / Jobs
app.post("/api/jobs", (req, res) => {
  console.log("\n==================================================");
  console.log("📥 [BACKEND] Nouvelle mission créée !");
  console.log("--------------------------------------------------");
  console.log(" Intitulé    :", req.body.title);
  console.log(" Salon       :", req.body.location);
  console.log(" Tarif       :", `${req.body.rate} €/h`);
  console.log(" Dates       :", req.body.dates);
  console.log(" Compétences :", req.body.skills ? req.body.skills.join(", ") : "Aucune");
  console.log("==================================================\n");

  res.status(201).json({
    message: "Mission publiée avec succès !",
    job: { id: Date.now().toString(), ...req.body },
  });
});

app.patch("/api/jobs/:id", (req, res) => {
  const { id } = req.params;
  console.log(`\n📥 [BACKEND] Modification de la mission ID: ${id} :`, req.body);

  res.status(200).json({
    message: "Mission mise à jour avec succès !",
    job: req.body,
  });
});

// 5. Routes modulaires (si configurées dans /routes)
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.listen(PORT, () => {
  console.log(`[OK] Serveur Node/TypeScript démarré sur http://localhost:${PORT}`);
});