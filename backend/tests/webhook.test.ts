import { sendMatchNotificationWebhook } from '../src/services/webhookService';

describe('TK-015 : Workflow de Notification Webhook & Anti-Doublon', () => {
  const sampleJob = {
    id: 'job-webhook-test-' + Date.now(),
    title: 'Coiffeur Coloriste H/F',
    salon: 'Salon Test',
    location: 'Paris',
    rate: 17
  };

  it('devrait refuser d\'envoyer le webhook si le score est inférieur au seuil (< 60%)', async () => {
    const result = await sendMatchNotificationWebhook({
      candidatId: 'cand-low',
      candidateEmail: 'candidat.bas@test.com',
      score: 55,
      job: sampleJob
    });

    expect(result.notified).toBe(false);
    expect(result.reason).toBe('below_threshold');
  });

  it('devrait refuser si l\'adresse email est invalide ou absente', async () => {
    const result = await sendMatchNotificationWebhook({
      candidatId: 'cand-no-email',
      candidateEmail: 'pasunemail',
      score: 80,
      job: sampleJob
    });

    expect(result.notified).toBe(false);
    expect(result.reason).toBe('invalid_email');
  });

  it('devrait bloquer les doublons pour la même offre et le même candidat', async () => {
    const uniqueCandId = 'cand-dup-' + Date.now();
    const uniqueEmail = `dup.${Date.now()}@test.com`;

    // Premier appel (succès ou envoi)
    const firstCall = await sendMatchNotificationWebhook({
      candidatId: uniqueCandId,
      candidateEmail: uniqueEmail,
      score: 75,
      job: sampleJob
    });

    expect(firstCall.notified).toBe(true);

    // Deuxième appel avec la même offre et le même candidat -> Doit être bloqué par l'anti-doublon
    const secondCall = await sendMatchNotificationWebhook({
      candidatId: uniqueCandId,
      candidateEmail: uniqueEmail,
      score: 80,
      job: sampleJob
    });

    expect(secondCall.notified).toBe(false);
    expect(secondCall.reason).toBe('already_notified');
  });
});
