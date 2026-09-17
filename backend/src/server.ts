import express from "express";
import cors from "cors";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Bienvenue sur l'API Interim'hair" });
});
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.listen(PORT, () => {
  console.log(`[OK] Serveur Node/TypeScript démarré sur http://localhost:${PORT}`);
});