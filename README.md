# 💇‍♂️ Interim'hair

Application de recrutement et de gestion de missions pour le secteur de la coiffure.

Ce projet est un **Monorepo** utilisant les NPM Workspaces. Il regroupe :
- **🎨 Frontend** : Application React (Vite, TypeScript, Tailwind CSS v4)
- **⚙️ Backend** : API REST Node.js (Express, TypeScript, Mongoose, Airtable)
- **🗄️ Base de données** : MongoDB (via Docker) & synchronisation Airtable
- **🛠 CLI d'ingestion** : Récupération des offres France Travail (Code ROME D1202)

---

## 🚀 Guide de Démarrage Étape par Étape

Suivez ces étapes dans l'ordre pour démarrer l'ensemble du projet en local.

### 1. Prérequis

Assurez-vous d'avoir installé sur votre machine :
- [Node.js](https://nodejs.org/) (version 20+ recommandée)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour lancer MongoDB)
- [Git](https://git-scm.com/)

---

### 2. Cloner et Installer les Dépendances

Clonez le projet et lancez l'installation globale des dépendances depuis la racine :

```bash
# 1. Cloner le dépôt
git clone https://github.com/Sami-epitech/INTERIM-HAIR.git
cd INTERIM-HAIR

# 2. Installer toutes les dépendances (Workspaces frontend, backend, CLI)
npm run setup
```

---

### 3. Configurer l'Environnement (`.env`)

Créez un fichier `.env` à la **racine du projet** avec les clés suivantes :

```env
# MongoDB (identifiants par défaut du docker-compose.yml)
MONGO_URI=mongodb://admin:password123@localhost:27017/interim_hair?authSource=admin

# URLs de l'application
FRONTEND_URL=http://localhost:5173
PORT=8000

# Airtable
AIRTABLE_API_KEY=votre_cle_api_airtable
AIRTABLE_BASE_ID=votre_base_id_airtable

# Webhook Airtable Matching
AIRTABLE_MATCHING_WEBHOOK_URL=https://hooks.airtable.com/workflows/v1/genericWebhook/...
MATCH_WEBHOOK_THRESHOLD=60

# France Travail (Module d'ingestion)
FT_CLIENT_ID=votre_client_id_francetravail
FT_CLIENT_SECRET=votre_client_secret_francetravail

# Authentification Google OAuth (optionnel en dev)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
```

---

### 4. Démarrer la Base de Données MongoDB (Docker)

Un conteneur Docker officiel MongoDB est préconfiguré dans `docker-compose.yml`.

Lancez le conteneur en arrière-plan depuis la racine :

```bash
docker compose up -d
```

* **Vérifier que MongoDB tourne :**
  ```bash
  docker compose ps
  ```
* **Voir les logs de MongoDB :**
  ```bash
  docker compose logs -f mongodb
  ```
* **Arrêter MongoDB :**
  ```bash
  docker compose down
  ```

---

### 5. Démarrer le Backend (API Express)

Dans un premier terminal, démarrez le serveur d'API :

```bash
# Depuis la racine :
npm run dev --workspace=backend

# OU directement depuis le dossier backend :
cd backend
npm run dev
```

* Le backend écoute sur : **`http://localhost:8000`**
* Il se connecte automatiquement à MongoDB et initialise les routes d'authentification, de synchronisation Airtable et de matching.

---

### 6. Démarrer le Frontend (React + Vite)

Dans un second terminal, démarrez l'interface utilisateur :

```bash
# Depuis la racine :
npm run dev --workspace=frontend

# OU directement depuis le dossier frontend :
cd frontend
npm run dev
```

* L'application web est accessible sur : **`http://localhost:5173`**
* Le frontend communique directement avec l'API backend via le proxy Vite `/api` configuré vers `http://localhost:8000`.

---

### 7. Exécuter les Tests

#### Tests Unitaires et d'Intégration (Jest)
Le backend contient des tests automatisés couvrant l'authentification, le chiffrement, l'algorithme de matching et le webhook Airtable :

```bash
# Lancer toute la suite de tests
npm test --workspace=backend

# Avec rapport de couverture de code
npm run test:coverage --workspace=backend
```

#### Test Autonome du Webhook et Anti-doublon
Pour tester le comportement du webhook Airtable et de la déduplication MongoDB en condition réelle :
```bash
npx tsx backend/src/test-webhook.ts
```

#### Tests E2E (Cypress)
```bash
cd backend
npm run cypress:run
```

---

### 8. CLI d'Ingestion France Travail (Optionnel)

Pour récupérer et dédoublonner les offres de coiffure depuis l'API France Travail :

```bash
npx tsx data-ingestion-cli/src/cli.ts fetch-jobs
```

---

## 📱 Tester depuis un Smartphone (ex: Partage 4G)

1. **Sur le même réseau local / Wi-Fi :**
   Accédez à l'IP locale de votre machine sur le port 5173 :
   `http://<VOTRE_IP_LOCALE>:5173/#role-select`
   *(Si Windows bloque la connexion, assurez-vous que le profil Wi-Fi est défini sur "Privé" dans Windows).*

2. **Via un tunnel public (100% garanti sans pare-feu) :**
   ```bash
   npx localtunnel --port 5173
   ```
   Ouvrez simplement l'URL générée (`https://xxxx.loca.lt`) sur votre smartphone.

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