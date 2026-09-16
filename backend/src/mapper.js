/**
 * Mapper pour la tâche TK-008 (Formulaire Dépôt d'Offre / Offres France Travail)
 * Convertit une offre brute France Travail au format attendu par le Front React.
 */
function transformerOffreFranceTravail(offreRaw) {
    // 1. Extraction et nettoyage des compétences exigées
    const competencesRaw = offreRaw.competences || [];
    let competencesListe = competencesRaw
        .map(c => c.libelle)
        .filter(Boolean);

    if (competencesListe.length === 0) {
        competencesListe = ["Polyvalence coiffure"];
    }

    // 2. Formatage du tarif horaire / salaire
    const salaireInfo = offreRaw.salaire || {};
    const salaireLibelle = salaireInfo.libelle || salaireInfo.commentaire || "Selon profil";

    // 3. Formatage de la date (ex: '2026-09-16')
    const dateRaw = offreRaw.dateCreation || offreRaw.dateActualisation || "";
    const dateFormatee = dateRaw ? dateRaw.substring(0, 10) : "Récemment";

    // 4. Construction de l'objet final au format exact de ton Front React
    return {
        id: String(offreRaw.id || ""),
        title: offreRaw.intitule || "Offre sans titre",
        salonName: (offreRaw.entreprise && offreRaw.entreprise.nom) || "Salon de coiffure",
        location: (offreRaw.lieuTravail && offreRaw.lieuTravail.libelle) || "Lieu non précisé",
        contractType: offreRaw.typeContratLibelle || offreRaw.typeContrat || "Intérim",
        hourlyRate: salaireLibelle,
        description: offreRaw.description || "Aucune description fournie.",
        requirements: competencesListe,
        datePosted: dateFormatee
    };
}

module.exports = { transformerOffreFranceTravail };

// --- Test de vérification local ---
if (require.main === module) {
    const exempleOffreFT = {
        id: "184XYZ",
        intitule: "Coiffeur / Coiffeuse mixte",
        entreprise: { nom: "Salon Tiff & Co" },
        lieuTravail: { libelle: "Lille - 59" },
        typeContratLibelle: "CDD",
        salaire: { libelle: "12.50 € par heure" },
        description: "Recherche un coiffeur autonome avec expérience...",
        competences: [{ libelle: "Coupe homme" }, { libelle: "Coloration" }],
        dateCreation: "2026-09-16T08:00:00.000Z"
    };

    console.log("--- RÉSULTAT DU MAPPER NODE.JS ---");
    console.log(transformerOffreFranceTravail(exempleOffreFT));
}