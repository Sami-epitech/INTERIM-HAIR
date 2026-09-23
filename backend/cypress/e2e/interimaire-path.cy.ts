// ════════════════════════════════════════════════════════════
// Test E2E - Parcours Critique Intérimaire (TK-020)
// ════════════════════════════════════════════════════════════

describe('Parcours Critique Intérimaire & Matching (TK-020)', () => {
  
  it('Doit permettre à l\'intérimaire de se connecter, voir son matching et postuler', () => {
    
    // 1. Visiter l'application
    cy.visit('http://localhost:5173'); 

    // 2. Sélectionner le rôle Intérimaire
    cy.contains(/intérimaire|candidat/i).click();

    // 3. Remplir le formulaire
    cy.get('input[type="email"]').type('qa.interimaire@example.com');
    cy.get('input[type="password"]').type('testqainterimaire');

    // 4. Cliquer sur le bouton de connexion
    cy.get('button').contains(/^Se connecter$/i).click();

    // 5. Vérification de l'arrivée sur le fil d'offres (feed)
    cy.url({ timeout: 15000 }).should('match', /feed|dashboard|jobs/i);

    // 6. Vérification du Module QA : Présence du pourcentage de match à l'écran
    cy.contains(/match/i, { timeout: 10000 }).should('be.visible');

    // 7. Cliquer sur "Postuler" sur la carte de l'offre pour ouvrir les détails
    cy.contains(/postuler/i).first().click({ force: true });

    // 8. Cliquer sur "Candidater" sur la page de détail de l'offre pour valider la candidature
    cy.contains(/candidater/i, { timeout: 10000 }).click({ force: true });

    cy.log('✅ [QA] Test End-to-End Intérimaire validé avec succès !');
  });

});