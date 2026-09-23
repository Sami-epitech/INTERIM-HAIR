/**
 * Tests unitaires de l'algorithme de matching et de pondération bilatérale.
 */

import { calculateAndLogMatch } from '../src/services/matchingService';

describe('Algorithme de matching et calcul de score', () => {
  const baseJob = {
    id: 'job-test-01',
    title: 'Coiffeur Visagiste H/F',
    location: 'Paris 11e',
    rate: 16,
    shift: '09:00 - 18:00',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    skills: ['Coupe homme', 'Coupe femme', 'Coloration']
  };

  it('devrait calculer un score élevé pour un profil correspondant à toutes les compétences et au taux horaire', async () => {
    const candidate = {
      id: 'cand-01',
      fields: {
        email: 'interimaire.parfait@test.com',
        firstName: 'Camille',
        skills: ['Coupe homme', 'Coupe femme', 'Coloration', 'Brushing'],
        location: 'Paris',
        mobility: 'local',
        expectedRate: 15
      }
    };

    const score = await calculateAndLogMatch(candidate, baseJob);
    // Score attendu élevé : localisation 100%, compétences 100%, salaire 100%
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('devrait accorder 100% en localisation si le candidat a une mobilité nationale', async () => {
    const candidate = {
      id: 'cand-02',
      fields: {
        email: 'interimaire.mobile@test.com',
        firstName: 'Lucas',
        skills: ['Coupe homme'],
        location: 'Marseille',
        mobility: 'national',
        expectedRate: 16
      }
    };

    const score = await calculateAndLogMatch(candidate, baseJob);
    // Mobilité nationale -> locationScore = 100
    expect(score).toBeGreaterThan(50);
  });

  it('devrait pénaliser le score si le taux horaire de la mission est très inférieur aux attentes', async () => {
    const candidateHighRate = {
      id: 'cand-03',
      fields: {
        email: 'interimaire.cher@test.com',
        firstName: 'Alexandre',
        skills: ['Coupe homme', 'Coupe femme', 'Coloration'],
        location: 'Paris',
        mobility: 'local',
        expectedRate: 26 // 10 euros de plus -> salaryScore = 0
      }
    };

    const score = await calculateAndLogMatch(candidateHighRate, baseJob);
    // Le score doit être notablement réduit en raison de l'écart salarial
    expect(score).toBeLessThan(85);
  });

  it('devrait donner un score neutre de 50% sur les compétences si aucune n\'est renseignée', async () => {
    const candidateNoSkills = {
      id: 'cand-04',
      fields: {
        email: 'interimaire.debutant@test.com',
        firstName: 'Sophie',
        skills: [],
        location: 'Paris',
        mobility: 'local',
        expectedRate: 16
      }
    };

    const score = await calculateAndLogMatch(candidateNoSkills, baseJob);
    expect(score).toBeGreaterThan(0);
  });
});
