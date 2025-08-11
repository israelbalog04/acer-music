# Configuration de la Base de Données de Production

## Problème
En production, les tables de la base de données Supabase n'existent pas, ce qui empêche l'application de fonctionner correctement.

## Solution

### 1. Configuration des Variables d'Environnement

Assurez-vous que les variables d'environnement suivantes sont configurées dans Vercel :

```bash
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
```

### 2. Déploiement du Schéma

#### Option A : Via GitHub Actions (Recommandé)

Le pipeline GitHub Actions inclut automatiquement :
- `prisma generate` dans le build
- Les tables seront créées lors du premier déploiement

#### Option B : Manuel (si nécessaire)

Si les tables ne sont pas créées automatiquement, exécutez manuellement :

```bash
# Dans l'environnement de production
npm run setup-prod-db
```

Ce script exécute :
1. `npx prisma generate` - Génère le client Prisma
2. `npx prisma db push` - Applique le schéma à la base de données
3. `npx prisma db seed` - Crée les données initiales

### 3. Vérification

Après le déploiement, vérifiez que les tables existent :

```sql
-- Dans l'interface Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

Vous devriez voir :
- `churches`
- `users`
- `songs`
- `schedules`
- `recordings`
- `teams`
- `availabilities`
- `sequences`
- `notifications`
- `musician_images`
- Et toutes les autres tables du schéma

### 4. Données Initiales

Le script de seed crée automatiquement :
- Église par défaut "ACER Paris"
- Comptes administrateurs de test (si configurés)

### 5. Résolution des Problèmes

#### Erreur "Table does not exist"
- Vérifiez que `DATABASE_URL` pointe vers la bonne base de données
- Exécutez `npm run setup-prod-db` manuellement

#### Erreur de connexion
- Vérifiez les variables d'environnement Supabase
- Assurez-vous que l'IP de Vercel est autorisée dans Supabase

#### Erreur de permissions
- Vérifiez que l'utilisateur de base de données a les droits suffisants
- Configurez les politiques RLS dans Supabase si nécessaire

## Commandes Utiles

```bash
# Vérifier la connexion à la base de données
npx prisma db pull

# Générer le client Prisma
npx prisma generate

# Appliquer le schéma
npx prisma db push

# Exécuter le seed
npx prisma db seed

# Ouvrir Prisma Studio (développement uniquement)
npx prisma studio
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement Vercel
2. Consultez les logs de la base de données Supabase
3. Testez la connexion avec `npx prisma db pull`
