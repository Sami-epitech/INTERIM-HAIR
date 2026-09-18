# 💇‍♂️ Interim'hair

Application de recrutement et de gestion de missions pour le secteur de la coiffure.

Ce projet est un **Monorepo** utilisant les NPM Workspaces. Il regroupe le Frontend, le Backend (en cours), et des outils CLI.

## 📦 Installation Globale

Depuis la racine du projet, exécutez la commande suivante pour installer les dépendances de **tous les sous-projets** (ainsi que les dépendances Python) :

```bash
npm run setup
```

Assurez-vous d'avoir configuré votre fichier `.env` à la racine (voir les prérequis spécifiques ci-dessous).

---

## 🎨 Frontend

Application React (Vite + TypeScript + Tailwind CSS v4), fidèle à la maquette Figma Make fournie.

### Scripts
Depuis la racine :
- `npm run dev --workspace=frontend` : Lance le serveur de développement sur `http://localhost:5174`
- `npm run build --workspace=frontend` : Vérifie les types et génère le build
- `npm run preview --workspace=frontend` : Sert le build localement

### Structure
```
frontend/src/
├── types.ts              → tous les types partagés
├── data/
│   └── mockData.ts       → données statiques (à remplacer par l'API)
├── components/
│   ├── ui/               → design system (boutons, inputs...)
│   └── icons/            → icônes SVG
├── screens/              → un composant par écran
├── utils/                → fonctions de formatage
├── App.tsx               → navigation et rendu
├── main.tsx              → point d'entrée
└── index.css             → thème Tailwind et styles globaux
```

### Palette de couleurs
Centralisée dans `frontend/src/index.css` (bloc `@theme`). **Ne jamais** écrire de couleur en dur (`#hex`) dans un composant, toujours utiliser les classes Tailwind générées (`bg-primary`, `text-muted-foreground`, etc.).

---

## 🛠 Data Ingestion CLI (Module France Travail)

Ce script CLI en TypeScript permet de récupérer automatiquement les offres d'emploi du secteur de la coiffure (Code ROME D1202) via l'API France Travail, puis de les dédoublonner.

### Prérequis
Demandez les identifiants France Travail à l'équipe et ajoutez-les au fichier `.env` à la racine :
```env
FT_CLIENT_ID=votre_client_id_ici
FT_CLIENT_SECRET=votre_client_secret_ici
```

### Exécution du Script
Depuis la racine :
```bash
npx tsx data-ingestion-cli/src/cli.ts fetch-jobs
```

---

# 📋 Règles Git & Workflow

## Convention de Nommage des Branches

Une branche = une tâche / feature identifiée par son code **`TK-xxx`**.

### Structure
- **`TK-xxx`** : Identifiant de la tâche (ex: `TK-001`, `TK-004`, `TK-016`)

## 🔄 Workflow Git

Suivez ce cycle de développement pour chaque tâche :

### 1. Se synchroniser avec la branche principale
Avant de commencer toute nouvelle tâche, placez-vous sur la branche principale (`main-test`) et récupérez les dernières modifications distantes :
```bash
git checkout main-test
git pull origin main-test
```

### 2. Créer et basculer sur sa branche de tâche
```bash
git checkout -b TK-xxx
```

### 3. Développer et découper en plusieurs commits
Il est recommandé de **découper votre travail en plusieurs petits commits logiques** :
```bash
git status
git add <fichiers>
git commit -m "TK-004: ajout du modèle et de la migration"
```

### 4. Publier sa branche sur le dépôt distant (Push)
```bash
git push -u origin TK-xxx
```

### 5. Créer la Pull Request (PR)
1. Rendez-vous sur votre plateforme Git (GitHub, GitLab...).
2. Cliquez sur **"Compare & pull request"**.
3. Renseignez :
   - **Branche cible** : `main-test`
   - **Titre** : Clair avec le code de la tâche (ex: `[TK-004] Système de hachage et tokens JWT`).
   - **Description** : Résumé des changements.

### 6. Relire, Valider et Fusionner (Merge)
1. Attendez la validation de l'équipe (review).
2. Procédez au **Merge** de la PR vers `main-test`.
3. Supprimez la branche distante.