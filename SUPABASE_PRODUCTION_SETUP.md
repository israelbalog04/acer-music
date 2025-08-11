# Configuration Supabase pour la Production

## ✅ État actuel de la configuration

### Configuration Supabase
- **URL Supabase** : `https://ecyihoruofcmvaifkvbc.supabase.co` ✅
- **Clé anonyme** : Configurée ✅
- **Clé service** : Configurée ✅
- **Mode de stockage** : `supabase` ✅
- **Package installé** : `@supabase/supabase-js` ✅

### Base de données
- **Développement** : SQLite (`file:./prisma/dev.db`) ✅
- **Production** : PostgreSQL Supabase (commenté) ⚠️

## 🔧 Configuration requise pour la production

### 1. Variables d'environnement de production

Dans votre environnement de production (Vercel, etc.), configurez :

```bash
# Base de données Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://ecyihoruofcmvaifkvbc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeWlob3J1b2ZjbXZhaWZrdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDgwOTYsImV4cCI6MjA3MDQyNDA5Nn0._zNphWLyKLMWjF7WBDaCTkXqoDbldvpnXXWdeqD-X7o"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeWlob3J1b2ZjbXZhaWZrdmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg0ODA5NiwiZXhwIjoyMDcwNDI0MDk2fQ.9qb6Me_cxCtrh10lMBgf3Qm0X0v-dkuND2Twb0Lrp10"

# Mode de stockage
STORAGE_TYPE="supabase"

# NextAuth
NEXTAUTH_URL="https://votre-app.vercel.app"
NEXTAUTH_SECRET="votre-secret-nextauth"
```

### 2. Configuration des buckets Supabase Storage

Dans votre dashboard Supabase, créez les buckets suivants :

#### Bucket `avatars`
- **Public** : ✅ Oui
- **Taille max** : 5MB
- **Politique RLS** : 
```sql
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

#### Bucket `recordings`
- **Public** : ❌ Non
- **Taille max** : 50MB
- **Politique RLS** :
```sql
CREATE POLICY "Users can upload recordings" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their recordings" ON storage.objects
FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Bucket `sequences`
- **Public** : ❌ Non
- **Taille max** : 10MB
- **Politique RLS** :
```sql
CREATE POLICY "Users can upload sequences" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'sequences' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their sequences" ON storage.objects
FOR SELECT USING (bucket_id = 'sequences' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Bucket `multimedia`
- **Public** : ✅ Oui
- **Taille max** : 20MB
- **Politique RLS** :
```sql
CREATE POLICY "Multimedia is publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'multimedia');
```

### 3. Migration de la base de données

#### Étape 1 : Activer la base de données Supabase
1. Dans votre fichier `.env` de production, décommentez :
```bash
DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres"
```

#### Étape 2 : Migrer le schéma
```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers Supabase
npm run db:push

# Ou utiliser les migrations
npx prisma migrate deploy
```

#### Étape 3 : Vérifier la connexion
```bash
# Tester la connexion
npx prisma db pull

# Ouvrir Prisma Studio
npm run db:studio
```

### 4. Configuration des politiques RLS (Row Level Security)

Dans votre dashboard Supabase SQL Editor, exécutez :

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Church" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Song" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventSong" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventDirector" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own data" ON "User"
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON "User"
FOR UPDATE USING (auth.uid()::text = id);

-- Politiques pour les églises
CREATE POLICY "Users can view their church data" ON "Church"
FOR SELECT USING (id IN (
  SELECT "churchId" FROM "User" WHERE auth.uid()::text = id
));

-- Politiques pour les événements
CREATE POLICY "Users can view church events" ON "Schedule"
FOR SELECT USING ("churchId" IN (
  SELECT "churchId" FROM "User" WHERE auth.uid()::text = id
));

-- Politiques pour les disponibilités
CREATE POLICY "Users can manage their availability" ON "Availability"
FOR ALL USING ("userId" = auth.uid()::text);

-- Politiques pour les chansons
CREATE POLICY "Users can view church songs" ON "Song"
FOR SELECT USING ("churchId" IN (
  SELECT "churchId" FROM "User" WHERE auth.uid()::text = id
));
```

### 5. Configuration des webhooks (optionnel)

Pour les notifications en temps réel :

```sql
-- Webhook pour les nouvelles notifications
CREATE OR REPLACE FUNCTION handle_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'id', NEW.id,
      'userId', NEW."userId",
      'type', NEW.type,
      'title', NEW.title
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_notification_created
  AFTER INSERT ON "Notification"
  FOR EACH ROW EXECUTE FUNCTION handle_new_notification();
```

## 🚀 Déploiement

### 1. Configuration Vercel

Dans votre projet Vercel, ajoutez les variables d'environnement :

1. **Settings** → **Environment Variables**
2. Ajoutez toutes les variables listées ci-dessus
3. **Production** : ✅
4. **Preview** : ✅ (optionnel)

### 2. Test de déploiement

```bash
# Build local avec les variables de production
DATABASE_URL="postgresql://..." npm run build

# Vérifier que tout fonctionne
npm run start
```

### 3. Migration des données (si nécessaire)

Si vous avez des données en développement à migrer :

```bash
# Exporter les données SQLite
npx prisma db pull --schema=./prisma/schema.prisma

# Importer vers Supabase (manuellement via Prisma Studio)
npm run db:studio
```

## 🔍 Vérifications post-déploiement

### 1. Test des fonctionnalités
- ✅ Upload de fichiers vers Supabase Storage
- ✅ Récupération d'URLs publiques et signées
- ✅ Connexion à la base de données PostgreSQL
- ✅ Authentification NextAuth
- ✅ Politiques RLS

### 2. Monitoring
- **Supabase Dashboard** : Surveiller l'utilisation
- **Vercel Analytics** : Performance de l'application
- **Logs** : Erreurs et warnings

### 3. Sécurité
- ✅ Variables d'environnement sécurisées
- ✅ Politiques RLS actives
- ✅ Clés Supabase protégées
- ✅ URLs de production configurées

## ⚠️ Points d'attention

### 1. Limites Supabase
- **Stockage** : 1GB gratuit, puis payant
- **Base de données** : 500MB gratuit, puis payant
- **Requêtes** : 50,000/mois gratuit, puis payant

### 2. Performance
- **CDN** : Supabase utilise Cloudflare
- **Cache** : Configurer les headers de cache
- **Optimisation** : Compresser les images

### 3. Sauvegarde
- **Automatique** : Supabase fait des sauvegardes quotidiennes
- **Manuelle** : Exporter régulièrement les données importantes

## 📞 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Vérifier les logs Supabase
3. Tester localement avec les variables de production
4. Consulter la documentation Supabase
