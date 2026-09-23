// ════════════════════════════════════════════════════════════
// Test E2E - Parcours Critique Recruteur (TK-020)
// ════════════════════════════════════════════════════════════

describe('Parcours Critique Recruteur & Dashboard (TK-020)', () => {
  
  it('Doit permettre au recruteur de se connecter et de voir les candidatures avec le score', () => {
    
    // 1. Visiter l'application
    cy.visit('http://localhost:5173'); 

    // 2. Sélectionner le rôle Recruteur (adapte selon ton libellé exact sur l'UI, ex: "Recruteur" ou "Entreprise")
    cy.contains(/recruteur|entreprise|partenaire/i).click();

    // 3. Remplir le formulaire avec le compte de test recruteur
    cy.get('input[type="email"]').type('qa.recruteur@example.com');
    cy.get('input[type="password"]').type('testqarecruteur');

    // 4. Cliquer sur le bouton de connexion
    cy.get('button').contains(/^Se connecter$/i).click();

    // 5. Vérification de l'arrivée sur le dashboard recruteur
    cy.url({ timeout: 15000 }).should('match', /dashboard|recruiter|missions/i);

    // 6. Vérification du Module QA : Présence des scores ou des cartes de candidatures
    cy.contains(/candidature|match|mission/i, { timeout: 10000 }).should('be.visible');

    cy.log('✅ [QA] Test End-to-End Recruteur validé avec succès !');
  });

});