/**
 * Service d'analyse de CV 100% local pour Interim'hair.
 * Extrait le texte d'un document PDF ou texte brut et applique des heuristiques
 * sémantiques et d'expressions régulières adaptées au secteur de la coiffure.
 */

export interface ExtractedCVProfile {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  diploma: string;
  skills: string[];
  experienceLevel: "Débutant" | "Intermédiaire" | "Confirmé" | "Expert";
  yearsOfExperience?: number;
  rawTextPreview?: string;
}

// Référentiel des compétences et règles de détection
const SKILLS_MAP: Array<{ skill: string; regex: RegExp }> = [
  { skill: "Coloriste", regex: /coloris|coloration|patine|ombr[eé]\s*hair|décoloration/i },
  { skill: "Balayage", regex: /balayage|shatush|painting/i },
  { skill: "Mèches", regex: /m[eè]che/i },
  { skill: "Visagiste", regex: /visagis|morphologie/i },
  { skill: "Coupe Homme", regex: /coupe\s*(?:hommes?|masculine)|barbier|d[eé]grad[eé]\s*am[eé]ricain/i },
  { skill: "Coupe Femme", regex: /coupe\s*(?:femmes?|f[eé]minine)|carr[eé]|effilage/i },
  { skill: "Rasage", regex: /rasage|taille\s*de\s*barbe|soin\s*barbe/i },
  { skill: "Kératine", regex: /k[eé]ratine|lissage\s*(?:br[eé]silien|tanin|japonais)/i },
  { skill: "Tresses", regex: /tresse|nattes?|chignon|attache|coiffure\s*de\s*(?:mari[eé]e|soir[eé]e)/i },
  { skill: "Brushing", regex: /brushing|wavy|mise\s*en\s*plis/i },
  { skill: "Permanente", regex: /permanente|ondulation|boucles/i },
];

// Hiérarchie des diplômes de la profession (du plus qualifié au premier échelon)
const DIPLOMAS_RULES: Array<{ label: string; regex: RegExp }> = [
  { label: "BM Coiffure", regex: /\b(?:BM|brevet\s+de\s+ma[iî]trise)\b/i },
  { label: "BTS Métiers de la Coiffure", regex: /\b(?:BTS|brevet\s+de\s+technicien\s+sup[eé]rieur)\b/i },
  { label: "BP Coiffure", regex: /\b(?:BP|brevet\s+professionnel)\b/i },
  { label: "Bac Pro Coiffure", regex: /\b(?:bac\s*pro|baccalaur[eé]at\s+professionnel)\b/i },
  { label: "Certificat Visagisme", regex: /certificat\s+visagis|formation\s+visagisme/i },
  { label: "Formation Colorimétrie", regex: /formation\s+colorim[eé]trie|expert\s+couleur/i },
  { label: "CAP Coiffure", regex: /\b(?:CAP|certificat\s+d'aptitude\s+professionnelle)\b/i },
];

// Villes récurrentes pour l'extraction de localisation
const CITIES_REGEX = /\b(Paris|Lyon|Marseille|Lille|Bordeaux|Toulouse|Nantes|Strasbourg|Rennes|Nice|Montpellier|Rouen|Toulon|Grenoble|Angers|Dijon|Reims)\b/i;

/**
 * Extrait le texte d'un buffer PDF avec pdf-parse.
 */
async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdf = require("pdf-parse");
    const res = await pdf(fileBuffer);
    return res.text || "";
  } catch (err) {
    console.warn("[LOCAL-CV-PARSER] Erreur lors de l'extraction PDF :", err);
    return fileBuffer.toString("utf-8");
  }
}

/**
 * Analyse le buffer d'un fichier (PDF ou TXT) et extrait les données de profil coiffure.
 */
export async function parseLocalCV(fileBuffer: Buffer, fileName: string = "cv.pdf"): Promise<ExtractedCVProfile> {
  let rawText = "";

  // 1. Extraction du texte selon le type de fichier
  const isPdf = fileName.toLowerCase().endsWith(".pdf") || fileBuffer.slice(0, 5).toString().startsWith("%PDF");

  if (isPdf) {
    rawText = await extractTextFromPDF(fileBuffer);
  } else {
    rawText = fileBuffer.toString("utf-8");
  }

  // Nettoyage des lignes
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 2. Extraction de l'Email et du Téléphone
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : undefined;

  const phoneMatch = rawText.match(/(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, " ") : undefined;

  // 3. Extraction du Nom complet
  let extractedName = "";
  const nameBlacklist = /curriculum|vitae|\bcv\b|coiff|profil|contact|exp[eé]rience|formation|comp[eé]tence|t[eé]l[eé]phone|adresse|email|mail|objectif|langue|permis|atout|ville/i;

  // Heuristique A : si l'adresse email contient prenom.nom, trouver la ligne correspondante
  if (email) {
    const userPart = email.split("@")[0];
    const emailParts = userPart.split(/[._-]/).filter((p) => p.length >= 2);
    if (emailParts.length >= 2) {
      const p1 = emailParts[0].toLowerCase();
      const p2 = emailParts[1].toLowerCase();
      for (const line of lines.slice(0, 40)) {
        const lineLower = line.toLowerCase();
        if (!line.includes("@") && lineLower.includes(p1) && lineLower.includes(p2) && line.split(/\s+/).length <= 4) {
          extractedName = line;
          break;
        }
      }
    }
  }

  // Heuristique B : scanner les premières lignes pour trouver un nom propre de 2 à 3 mots
  if (!extractedName) {
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      const line = lines[i];
      if (nameBlacklist.test(line) || line.includes("@") || /\d/.test(line) || line.length > 35) continue;

      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && words.every((w) => w.length > 1 && !w.includes("/"))) {
        extractedName = line;
        break;
      }
    }
  }

  if (!extractedName) {
    extractedName = "Marie Dupont"; // Valeur fallback
  }

  // 5. Extraction de la Localisation
  const cityMatch = rawText.match(CITIES_REGEX);
  const location = cityMatch ? cityMatch[1] : undefined;

  // 6. Extraction du Diplôme principal
  let diploma = "CAP Coiffure";
  for (const rule of DIPLOMAS_RULES) {
    if (rule.regex.test(rawText)) {
      diploma = rule.label;
      break; // Prend le plus qualifié selon l'ordre du tableau
    }
  }

  // 7. Détection des Compétences
  const skillsSet = new Set<string>();
  for (const { skill, regex } of SKILLS_MAP) {
    if (regex.test(rawText)) {
      skillsSet.add(skill);
    }
  }

  // Assurer au minimum les compétences de base si très peu détectées
  if (skillsSet.size === 0) {
    skillsSet.add("Coupe Femme");
    skillsSet.add("Brushing");
  }

  const skills = Array.from(skillsSet);

  // 8. Évaluation du Niveau d'expérience
  let experienceLevel: "Débutant" | "Intermédiaire" | "Confirmé" | "Expert" = "Confirmé";
  let yearsFound: number | undefined;

  const yearsMatch = rawText.match(/(\d+)\s*(?:ans?|ann[eé]es?)\s*(?:d['’]exp[eé]rience|en\s+salon|de\pratique)?/i);
  if (yearsMatch) {
    yearsFound = parseInt(yearsMatch[1], 10);
  }

  // Détection de dates (ex: 2017 - 2024 -> 7 ans)
  if (!yearsFound) {
    const dates = Array.from(rawText.matchAll(/\b(20[0-2]\d)\b/g)).map((m) => parseInt(m[1], 10));
    if (dates.length >= 2) {
      const minYear = Math.min(...dates);
      const maxYear = Math.max(...dates);
      if (maxYear - minYear >= 1 && maxYear - minYear <= 35) {
        yearsFound = maxYear - minYear;
      }
    }
  }

  // Attribution du niveau
  if (yearsFound !== undefined) {
    if (yearsFound >= 6) {
      experienceLevel = "Expert";
    } else if (yearsFound >= 3) {
      experienceLevel = "Confirmé";
    } else if (yearsFound >= 1) {
      experienceLevel = "Intermédiaire";
    } else {
      experienceLevel = "Débutant";
    }
  } else {
    // Indices contextuels
    if (/manager|responsable|salon\s+manager|ma[iî]tre|expert/i.test(rawText)) {
      experienceLevel = "Expert";
    } else if (/junior|d[eé]butant|apprenti|d[eé]butante/i.test(rawText)) {
      experienceLevel = "Débutant";
    }
  }

  return {
    name: extractedName,
    email,
    phone,
    location,
    diploma,
    skills,
    experienceLevel,
    yearsOfExperience: yearsFound,
    rawTextPreview: lines.slice(0, 5).join(" | ")
  };
}
