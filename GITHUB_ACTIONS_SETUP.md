# Guide de Configuration - GitHub Actions

## Vue d'ensemble

Ce guide explique comment configurer les GitHub Actions pour l'application ACER Music, incluant les secrets nécessaires et les étapes de configuration.

## Workflows créés

### 1. `ci-cd.yml` - Pipeline CI/CD principal
- **Déclencheurs** : Push sur `main` et `develop`, Pull Requests
- **Fonctionnalités** : Tests, sécurité, déploiement automatique
- **Environnements** : Staging (develop) et Production (main)

### 2. `pull-request.yml` - Vérifications PR
- **Déclencheurs** : Pull Requests sur `main` et `develop`
- **Fonctionnalités** : Qualité du code, tests, sécurité, commentaires automatiques

### 3. `manual-deploy.yml` - Déploiement manuel
- **Déclencheurs** : Workflow dispatch (manuel)
- **Fonctionnalités** : Déploiement à la demande, choix d'environnement

## Configuration des Secrets GitHub

### Secrets requis pour Vercel

1. **VERCEL_TOKEN**
   - Obtenez-le depuis [Vercel Dashboard](https://vercel.com/account/tokens)
   - Token d'accès pour l'API Vercel

2. **VERCEL_ORG_ID**
   - ID de votre organisation Vercel
   - Trouvable dans les paramètres de l'organisation

3. **VERCEL_PROJECT_ID**
   - ID de votre projet Vercel
   - Trouvable dans les paramètres du projet

### Secrets pour les bases de données

4. **STAGING_DATABASE_URL**
   - URL de connexion à la base de données de staging
   - Format : `file:./staging.db` (SQLite) ou URL PostgreSQL

5. **PRODUCTION_DATABASE_URL**
   - URL de connexion à la base de données de production
   - Format : `file:./production.db` (SQLite) ou URL PostgreSQL

### Secrets pour NextAuth

6. **NEXTAUTH_SECRET**
   - Clé secrète pour NextAuth.js
   - Générée avec : `openssl rand -base64 32`

7. **NEXTAUTH_URL**
   - URL de base de l'application
   - Exemple : `https://your-app.vercel.app`

### Secrets pour les environnements

8. **STAGING_URL**
   - URL de l'environnement de staging
   - Exemple : `https://staging-your-app.vercel.app`

9. **PRODUCTION_URL**
   - URL de l'environnement de production
   - Exemple : `https://your-app.vercel.app`

### Secrets pour la sécurité

10. **SNYK_TOKEN**
    - Token pour l'analyse de sécurité Snyk
    - Obtenez-le depuis [Snyk](https://app.snyk.io/account)

11. **SLACK_WEBHOOK_URL**
    - Webhook Slack pour les notifications
    - Optionnel, pour les notifications de déploiement

## Étapes de configuration

### 1. Configuration des secrets

1. Allez dans votre repository GitHub
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret listé ci-dessus

### 2. Configuration des environnements

1. Dans **Settings** > **Environments**
2. Créez les environnements :
   - **staging** : Pour les tests
   - **production** : Pour la production

### 3. Configuration des branches

1. Dans **Settings** > **Branches**
2. Configurez les règles de protection :
   - **main** : Requiert les checks de PR
   - **develop** : Requiert les checks de PR

## Utilisation des workflows

### Déploiement automatique

- **Push sur `develop`** → Déploiement staging automatique
- **Push sur `main`** → Déploiement production automatique
- **Pull Request** → Vérifications automatiques

### Déploiement manuel

1. Allez dans **Actions** > **Déploiement Manuel**
2. Cliquez sur **Run workflow**
3. Choisissez l'environnement (staging/production)
4. Optionnellement, spécifiez une version

### Vérifications de Pull Request

Chaque PR déclenche automatiquement :
- ✅ Qualité du code (ESLint, Prettier, TypeScript)
- ✅ Tests automatisés
- ✅ Analyse de sécurité
- ✅ Build et vérifications
- ✅ Tests de base de données
- ✅ Vérifications de performance
- ✅ Commentaire de résumé automatique

## Scripts npm ajoutés

```json
{
  "type-check": "tsc --noEmit",
  "test": "echo 'Tests unitaires à implémenter'",
  "test:integration": "echo 'Tests d\\'intégration à implémenter'",
  "test:coverage": "echo 'Couverture de tests à implémenter'"
}
```

## Monitoring et notifications

### Notifications Slack

Les workflows envoient des notifications Slack pour :
- ✅ Succès de déploiement
- ❌ Échec de déploiement
- 📊 Résumé des vérifications PR

### Métriques surveillées

- **Temps de build** : < 5 minutes
- **Taille du bundle** : < 50MB
- **Couverture de tests** : À implémenter
- **Vulnérabilités** : Aucune critique/haute

## Dépannage

### Problèmes courants

#### Erreur de build
```bash
# Vérifier localement
npm run build
npm run type-check
npm run lint
```

#### Erreur de déploiement Vercel
- Vérifier les secrets VERCEL_*
- Vérifier les permissions du token
- Vérifier la configuration du projet

#### Erreur de base de données
- Vérifier les URLs de base de données
- Vérifier les permissions d'accès
- Tester les connexions localement

### Commandes de diagnostic

```bash
# Test local des scripts
npm run type-check
npm run lint
npm run build

# Test des scripts de base de données
node scripts/test-event-repertoire.js
node scripts/test-repertoire-apis.js

# Vérification des secrets (local)
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
```

## Évolutions futures

### Améliorations prévues

1. **Tests automatisés**
   - Jest pour les tests unitaires
   - Playwright pour les tests E2E
   - Tests de performance

2. **Monitoring avancé**
   - Intégration avec Sentry
   - Métriques de performance
   - Alertes automatiques

3. **Sécurité renforcée**
   - Scan de dépendances automatisé
   - Audit de sécurité régulier
   - Rotation automatique des secrets

4. **Déploiement avancé**
   - Déploiement blue-green
   - Rollback automatique
   - Tests de régression

### Intégrations possibles

- **Codecov** : Couverture de code
- **SonarCloud** : Qualité du code
- **Dependabot** : Mises à jour automatiques
- **Renovate** : Gestion des dépendances
