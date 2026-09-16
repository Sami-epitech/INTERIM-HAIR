# Frontend — Interim'hair

Application React (Vite + TypeScript + Tailwind CSS v4), fidèle à la maquette
Figma Make fournie. C'est la partie fonctionnelle du projet pour l'instant.

## Installation

```bash
npm install
npm run dev
```

Ouvre ensuite `http://localhost:5173`.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le serveur de développement (rechargement à chaud) |
| `npm run build` | Vérifie les types TypeScript puis génère le build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local, pour vérifier avant déploiement |

## Structure

```
frontend/src/
├── types.ts              → tous les types partagés (Screen, Job, Mission...)
├── data/
│   └── mockData.ts       → données statiques (à remplacer par l'API plus tard)
├── components/
│   ├── ui/                → design system (boutons, inputs, badges...) — voir ui/index.ts
│   └── icons/              → toutes les icônes SVG de l'app
├── screens/                → un composant par écran de la maquette
├── utils/
│   └── format.ts           → petites fonctions de formatage (dates...)
├── App.tsx                  → état de navigation + rendu de l'écran courant
├── main.tsx                 → point d'entrée React
└── index.css                → palette de couleurs (thème Tailwind) + styles globaux
```

## Palette de couleurs

Centralisée dans `src/index.css` (bloc `@theme`). Voir le README à la racine
du projet pour le détail des couleurs et leur usage — **ne jamais** écrire de
couleur en dur (`#hex`) dans un composant, toujours passer par les classes
Tailwind générées (`bg-primary`, `text-muted-foreground`, etc.).

## Prochaine étape

Brancher les écrans sur l'API du dossier `../backend/` (actuellement en
squelette) à la place des données mockées de `src/data/mockData.ts`.
