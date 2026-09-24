/**
 * Tests unitaires du parser de CV 100% local pour Interim'hair.
 */

import { parseLocalCV } from '../src/services/localCVParser';

describe('Système de parsing local de CV pour coiffeurs', () => {
  it('devrait extraire correctement les informations clés depuis un texte de CV', async () => {
    const sampleCVText = `
      Camille Laurent
      camille.laurent@epitech.eu | 06 12 34 56 78
      Paris 11e - Titulaire du permis B

      PROFIL PROFESSIONNEL
      Coiffeuse passionnée avec 6 ans d'expérience en salon haut de gamme.
      Spécialiste de la coloration sur-mesure, du balayage californien et du visagisme.

      FORMATIONS & DIPLÔMES
      2018 - BP Coiffure (Brevet Professionnel) - CFA de la Coiffure Paris
      2016 - CAP Coiffure

      COMPÉTENCES TECHNIQUES
      - Coloriste experte (ombré hair, patine, décoloration)
      - Balayage et mèches personnalisées
      - Visagiste et conseil morphologique
      - Coupe femme (carré plongeant, dégradé)
      - Coupe homme et dégradé américain
      - Brushing wavy et mise en plis
      - Soins profonds à la kératine

      EXPÉRIENCES PROFESSIONNELLES
      2020 - 2024 : Coiffeuse Coloriste - Salon L'Élégance, Paris
      2018 - 2020 : Coiffeuse Polyvalente - Salon Studio Chic, Lyon
    `;

    const buffer = Buffer.from(sampleCVText, 'utf-8');
    const result = await parseLocalCV(buffer, 'cv_camille_laurent.txt');

    expect(result.name).toBe('Camille Laurent');
    expect(result.email).toBe('camille.laurent@epitech.eu');
    expect(result.phone).toBe('06 12 34 56 78');
    expect(result.location).toBe('Paris');
    expect(result.diploma).toBe('BP Coiffure');
    expect(result.skills).toContain('Coloriste');
    expect(result.skills).toContain('Balayage');
    expect(result.skills).toContain('Visagiste');
    expect(result.skills).toContain('Coupe Femme');
    expect(result.skills).toContain('Coupe Homme');
    expect(result.skills).toContain('Kératine');
    expect(result.experienceLevel).toBe('Expert');
  });

  it('devrait fournir des valeurs de repli cohérentes si le document est minimal', async () => {
    const minimalCV = `
      Alex Martin
      alex.martin@test.fr
      Débutant recherche mission
      CAP Coiffure obtenu en 2023
    `;

    const buffer = Buffer.from(minimalCV, 'utf-8');
    const result = await parseLocalCV(buffer, 'cv_minimal.txt');

    expect(result.name).toBe('Alex Martin');
    expect(result.email).toBe('alex.martin@test.fr');
    expect(result.diploma).toBe('CAP Coiffure');
    expect(result.experienceLevel).toBe('Débutant');
    expect(result.skills.length).toBeGreaterThan(0);
  });

  it('devrait parser avec succès le vrai fichier PDF de démonstration généré', async () => {
    const fs = require('fs');
    const path = require('path');
    const demoPdfPath = path.resolve(__dirname, '../../CV_Demo_InterimHair.pdf');

    if (fs.existsSync(demoPdfPath)) {
      const pdfBuffer = fs.readFileSync(demoPdfPath);
      const result = await parseLocalCV(pdfBuffer, 'CV_Demo_InterimHair.pdf');

      expect(result.name).toBe('Camille Laurent');
      expect(result.email).toBe('camille.laurent@epitech.eu');
      expect(result.phone).toBe('06 12 34 56 78');
      expect(result.diploma).toBe('BP Coiffure');
      expect(result.skills).toContain('Coloriste');
      expect(result.skills).toContain('Balayage');
      expect(result.skills).toContain('Visagiste');
      expect(result.experienceLevel).toBe('Expert');
    }
  });

  it('devrait parser avec succès le CV Junior de démonstration (profil débutant, CAP)', async () => {
    const fs = require('fs');
    const path = require('path');
    const juniorPdfPath = path.resolve(__dirname, '../../CV_Demo_Junior_InterimHair.pdf');

    if (fs.existsSync(juniorPdfPath)) {
      const pdfBuffer = fs.readFileSync(juniorPdfPath);
      const result = await parseLocalCV(pdfBuffer, 'CV_Demo_Junior_InterimHair.pdf');

      expect(result.name).toBe('Lucas Bernard');
      expect(result.email).toBe('lucas.bernard@epitech.eu');
      expect(result.phone).toBe('07 89 01 23 45');
      expect(result.location).toBe('Lille');
      expect(result.diploma).toBe('CAP Coiffure');
      expect(result.skills).toContain('Coupe Femme');
      expect(result.skills).toContain('Brushing');
      expect(result.skills).not.toContain('Coloriste');
      expect(result.skills).not.toContain('Balayage');
      expect(result.experienceLevel).toBe('Intermédiaire');
    }
  });
});
