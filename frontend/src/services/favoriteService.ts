/**
 * Service de synchronisation des offres favorites avec l'API backend et Airtable.
 */

import type { Job } from "../types";

/**
 * Récupère les offres favorites de l'utilisateur connecté depuis le backend.
 *
 * @returns Liste des identifiants et objets complets des offres favorites.
 */
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
    console.log("[FRONTEND] Favoris chargés depuis Airtable :", data);
    return {
      favoriteIds: data.favoriteIds || [],
      jobs: data.jobs || [],
    };
  } catch (error) {
    console.error("[FRONTEND] Erreur chargement favoris :", error);
    return { favoriteIds: [], jobs: [] };
  }
}

/**
 * Ajoute une offre à la liste des favoris de l'utilisateur.
 *
 * @param job - Détails de l'offre à enregistrer en favori.
 * @returns Liste actualisée des identifiants favoris.
 */
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
    console.log("[FRONTEND] Favori ajouté dans Airtable :", data);
    return data.favoriteIds || [];
  } catch (error) {
    console.error("[FRONTEND] Erreur apiAddFavorite :", error);
    throw error;
  }
}

/**
 * Retire une offre de la liste des favoris de l'utilisateur.
 *
 * @param jobId - Identifiant de l'offre à retirer.
 * @returns Liste actualisée des identifiants favoris.
 */
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
    console.log("[FRONTEND] Favori retiré dans Airtable :", data);
    return data.favoriteIds || [];
  } catch (error) {
    console.error("[FRONTEND] Erreur apiRemoveFavorite :", error);
    throw error;
  }
}

