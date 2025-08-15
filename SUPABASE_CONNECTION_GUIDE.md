# Guide de Résolution des Problèmes de Connexion Supabase

## Problème
Erreur: `Can't reach database server at db.ecyihoruofcmvaifkvbc.supabase.co:5432`

## Solutions

### 1. Configuration des Variables d'Environnement dans Vercel

Allez dans votre projet Vercel et configurez ces variables :

#### Variables Requises
```bash
DATABASE_URL="postgresql://postgres:[password]@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://ecyihoruofcmvaifkvbc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[votre-clé-anon]"
SUPABASE_SERVICE_ROLE_KEY="[votre-clé-service]"
NEXTAUTH_SECRET="[votre-secret-nextauth]"
NEXTAUTH_URL="https://[votre-app].vercel.app"
```

#### Comment obtenir ces valeurs :

1. **DATABASE_URL** :
   - Allez dans Supabase Dashboard
   - Settings > Database
   - Copiez "Connection string" > "URI"

2. **NEXT_PUBLIC_SUPABASE_URL** :
   - Supabase Dashboard > Settings > API
   - Copiez "Project URL"

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** :
   - Supabase Dashboard > Settings > API
   - Copiez "anon public" key

4. **SUPABASE_SERVICE_ROLE_KEY** :
   - Supabase Dashboard > Settings > API
   - Copiez "service_role" key

### 2. Configuration des Politiques RLS dans Supabase

Dans Supabase Dashboard > Authentication > Policies :

#### Pour la table `churches` :
```sql
-- Permettre la lecture publique des églises
CREATE POLICY "Enable read access for all users" ON "public"."churches"
FOR SELECT USING (true);

-- Permettre l'insertion pour les utilisateurs authentifiés
CREATE POLICY "Enable insert for authenticated users" ON "public"."churches"
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### Pour la table `users` :
```sql
-- Permettre la lecture pour les utilisateurs de la même église
CREATE POLICY "Users can view users from same church" ON "public"."users"
FOR SELECT USING (auth.jwt() ->> 'churchId' = "churchId"::text);

-- Permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile" ON "public"."users"
FOR UPDATE USING (auth.uid()::text = "id");
```

### 3. Configuration des IPs Autorisées

Dans Supabase Dashboard > Settings > Database :

1. **Autoriser Vercel** :
   - Ajoutez `0.0.0.0/0` pour autoriser toutes les IPs (temporaire)
   - Ou ajoutez les IPs spécifiques de Vercel

2. **Autoriser votre IP locale** :
   - Ajoutez votre IP locale pour les tests

### 4. Vérification de la Connexion

#### Test local :
```bash
npm run test-supabase
```

#### Test en production :
1. Allez dans Vercel Dashboard
2. Functions > View Function Logs
3. Vérifiez les logs d'erreur

### 5. Création des Tables

Si les tables n'existent pas :

#### Option A : Via Vercel (recommandé)
Le script `vercel-postbuild` s'exécute automatiquement :
```bash
prisma db push --accept-data-loss && npm run db:seed
```

#### Option B : Manuel
```bash
# Dans l'environnement de production
npm run setup-prod-db
```

### 6. Diagnostic Avancé

#### Vérifier la connexion directe :
```bash
# Test avec psql (si installé)
psql "postgresql://postgres:[password]@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres"
```

#### Vérifier les logs Supabase :
1. Supabase Dashboard > Logs
2. Vérifiez les erreurs de connexion

### 7. Résolution des Erreurs Communes

#### "Can't reach database server"
- ✅ Vérifiez l'URL de la base de données
- ✅ Vérifiez que Supabase est actif
- ✅ Vérifiez les politiques RLS
- ✅ Vérifiez les IPs autorisées

#### "authentication failed"
- ✅ Vérifiez les identifiants
- ✅ Vérifiez les permissions utilisateur

#### "relation does not exist"
- ✅ Exécutez `npm run setup-prod-db`
- ✅ Vérifiez que les migrations sont appliquées

### 8. Commandes Utiles

```bash
# Test de connexion
npm run test-supabase

# Vérifier l'état de la DB
npm run check-db

# Configurer la DB de production
npm run setup-prod-db

# Debug du build
npm run debug-build
```

### 9. Support

Si le problème persiste :
1. Vérifiez les logs Vercel
2. Vérifiez les logs Supabase
3. Testez la connexion locale
4. Contactez le support Supabase si nécessaire
