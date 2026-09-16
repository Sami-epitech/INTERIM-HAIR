# 📋 Règles Git & Workflow - INTERIM'HAIR

## Convention de Nommage des Branches

Une branche = une tâche / feature identifiée par son code **`TK-xxx`**.

### Structure

- **`TK-xxx`** : Identifiant de la tâche (ex: `TK-001`, `TK-004`, `TK-016`)

### Exemples

- `TK-004`
- `TK-016`

---

## 🔄 Workflow Git

Suivez ce cycle de développement pour chaque tâche :

### 1. Se synchroniser avec la branche principale
Avant de commencer toute nouvelle tâche, placez-vous sur la branche principale (`main-test`) et récupérez les dernières modifications distantes :

```bash
git checkout main-test
git pull origin main-test
```

### 2. Créer et basculer sur sa branche de tâche
Créez votre branche avec l'identifiant de la tâche :

```bash
git checkout -b TK-xxx
```

### 3. Développer et découper en plusieurs commits
Il est recommandé de **découper votre travail en plusieurs petits commits logiques** au fur et à mesure de votre avancement sur la feature avant de pousser :

```bash
# Vérifier l'état des fichiers
git status

# Ajouter et committer une première étape (ex: la structure de base)
git add <fichiers>
git commit -m "TK-004: ajout du modèle et de la migration"

# Continuer le développement, puis committer l'étape suivante
git add <fichiers>
git commit -m "TK-004: implémentation de la logique de hachage"

# Ajouter les tests ou corrections
git add <fichiers>
git commit -m "TK-004: ajout des tests unitaires"
```

### 4. Publier sa branche sur le dépôt distant (Push)
Une fois vos commits réalisés et la feature prête, poussez l'ensemble des commits sur le dépôt distant :

```bash
# Premier push de la branche :
git push -u origin TK-xxx
```
*Pour les pushs suivants sur cette même branche, un simple `git push` suffit.*

### 5. Créer la Pull Request (PR)
1. Rendez-vous sur votre plateforme Git (GitHub, GitLab...).
2. Cliquez sur **"Compare & pull request"**.
3. Renseignez :
   - **Branche cible** : `main-test`
   - **Titre** : Clair avec le code de la tâche (ex: `[TK-004] Système de hachage et tokens JWT`).
   - **Description** : Résumé des changements apportés et des commits inclus.

### 6. Relire, Valider et Fusionner (Merge)
1. Attendez la validation de l'équipe (review).
2. Procédez au **Merge** de la PR sur l'interface vers `main-test`.
3. Supprimez la branche distante une fois fusionnée.

