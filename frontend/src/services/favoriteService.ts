import type { Job } from "../types";

// Récupérer les favoris depuis le backend (Airtable)
export async function fetchUserFavorites(): Promise<{ favoriteIds: (string | number)[]; jobs: Job[] }> {
  try {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId");

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = userId
      ? `http://localhost:8000/api/favorites?candidateId=${encodeURIComponent(userId)}`
      : "http://localhost:8000/api/favorites";

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Erreur réseau chargement favoris");

    const data = await res.json();
    console.log("⭐ [FRONTEND] Favoris chargés depuis Airtable :", data);
    return {
      favoriteIds: data.favoriteIds || [],
      jobs: data.jobs || [],
    };
  } catch (error) {
    console.error("❌ [FRONTEND] Erreur chargement favoris :", error);
    return { favoriteIds: [], jobs: [] };
  }
}

// Ajouter un favori dans Airtable (concaténation)
export async function apiAddFavorite(job: Job): Promise<(string | number)[]> {
  try {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:8000/api/favorites", {
      method: "POST",
      headers,
      body: JSON.stringify({
        jobId: job.id,
        jobData: job,
        candidateId: userId || undefined,
      }),
    });

    if (!res.ok) throw new Error("Erreur lors de l'ajout du favori");
    const data = await res.json();
    console.log("⭐ [FRONTEND] Favori ajouté dans Airtable :", data);
    return data.favoriteIds || [];
  } catch (error) {
    console.error("❌ [FRONTEND] Erreur apiAddFavorite :", error);
    throw error;
  }
}

// Retirer un favori dans Airtable
export async function apiRemoveFavorite(jobId: string | number): Promise<(string | number)[]> {
  try {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:8000/api/favorites/${jobId}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        candidateId: userId || undefined,
      }),
    });

    if (!res.ok) throw new Error("Erreur lors de la suppression du favori");
    const data = await res.json();
    console.log("⭐ [FRONTEND] Favori retiré dans Airtable :", data);
    return data.favoriteIds || [];
  } catch (error) {
    console.error("❌ [FRONTEND] Erreur apiRemoveFavorite :", error);
    throw error;
  }
}
