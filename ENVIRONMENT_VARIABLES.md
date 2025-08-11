# Configuration des Variables d'Environnement

## Variables Requises

### Base de Données
```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

### NextAuth
```bash
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## Configuration Locale

1. Créez un fichier `.env.local` à la racine du projet
2. Copiez les variables ci-dessus et remplacez les valeurs par vos vraies données

## Configuration Vercel

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

### Variables de Production
- `DATABASE_URL` - URL de votre base de données Supabase
- `NEXTAUTH_SECRET` - Clé secrète pour NextAuth
- `NEXTAUTH_URL` - URL de votre application (ex: https://your-app.vercel.app)
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé de service Supabase

## Configuration GitHub Actions

Dans les secrets GitHub (Settings > Secrets and variables > Actions), ajoutez :

### Secrets Requis
- `PRODUCTION_DATABASE_URL` - URL de la base de données de production
- `STAGING_DATABASE_URL` - URL de la base de données de staging
- `NEXTAUTH_SECRET` - Clé secrète NextAuth
- `PRODUCTION_URL` - URL de production
- `STAGING_URL` - URL de staging
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé de service Supabase
- `VERCEL_TOKEN` - Token Vercel
- `VERCEL_ORG_ID` - ID de l'organisation Vercel
- `VERCEL_PROJECT_ID` - ID du projet Vercel

## Génération des Clés

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Vercel Token
1. Allez sur https://vercel.com/account/tokens
2. Créez un nouveau token
3. Copiez le token généré

### Vercel Project ID
1. Dans votre projet Vercel, allez dans Settings
2. Le Project ID est affiché en haut de la page

## Vérification

Après avoir configuré les variables, testez avec :

```bash
# Vérifier la connexion à la base de données
npm run check-db

# Configurer la base de données (si nécessaire)
npm run setup-prod-db
```

## Résolution des Problèmes

### Erreur "Environment variable not found"
- Vérifiez que toutes les variables sont définies dans Vercel
- Assurez-vous que les noms correspondent exactement

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correct
- Assurez-vous que l'IP de Vercel est autorisée dans Supabase

### Erreur NextAuth
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Assurez-vous que `NEXTAUTH_URL` correspond à votre domaine
