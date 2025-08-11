# Checklist Production - ACER Music

## 🎯 **Ce qu'il reste à faire pour la prod**

### 🔴 **CRITIQUE - Variables d'environnement**

#### 1. **Supabase** (partiellement configuré)
```bash
# ✅ Déjà configuré
NEXT_PUBLIC_SUPABASE_URL="https://ecyihoruofcmvaifkvbc.supabase.co"

# ❌ À compléter avec les vraies clés
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"           # Remplacer
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"      # Remplacer
DATABASE_URL="postgresql://postgres:PASSWORD@db.ecyihoruofcmvaifkvbc.supabase.co:5432/postgres"  # Décommenter et compléter
```

#### 2. **NextAuth** (à configurer)
```bash
# ❌ À configurer
NEXTAUTH_URL="https://votre-domaine.com"               # URL de production
NEXTAUTH_SECRET="secret-32-caractères-minimum"         # Générer un secret fort
```

#### 3. **Email SMTP** (à configurer)
```bash
# ❌ À configurer avec vos vrais identifiants
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="production@acer-paris.com"
SMTP_PASS="votre-mot-de-passe-app"
SMTP_FROM="ACER Music <noreply@acer-paris.com>"
```

#### 4. **AWS S3** (pour le stockage fichiers)
```bash
# ❌ À configurer si vous voulez le stockage cloud
AWS_ACCESS_KEY_ID="votre-access-key"
AWS_SECRET_ACCESS_KEY="votre-secret-key"
AWS_REGION="eu-west-3"
AWS_S3_BUCKET="acer-music-files"
AWS_CLOUDFRONT_URL="https://votre-cdn.cloudfront.net"  # Optionnel
```

### 🟡 **IMPORTANT - Configuration technique**

#### 5. **Base de données** (prêt mais pas appliqué)
```bash
# Actions à faire :
npm run switch:prod        # Basculer vers PostgreSQL
npx prisma db push         # Appliquer le schéma à Supabase
npm run db:seed            # Créer les données initiales
```

#### 6. **Domaine et déploiement**
- [ ] Nom de domaine acheté et configuré
- [ ] Certificat SSL (automatique avec Vercel/Netlify)
- [ ] DNS pointant vers l'hébergeur

### 🟢 **OPTIONNEL - Améliorations**

#### 7. **Monitoring et analytics**
- [ ] Sentry pour le monitoring d'erreurs
- [ ] Google Analytics ou Plausible
- [ ] Uptime monitoring

#### 8. **Performance**
- [ ] Optimisation des images (déjà fait avec Next.js)
- [ ] CDN pour les assets statiques
- [ ] Cache Redis (si nécessaire)

#### 9. **Sécurité**
- [ ] Rate limiting
- [ ] CORS configuré
- [ ] Headers de sécurité

## 🚀 **Plan de déploiement recommandé**

### Phase 1: **Configuration (30 min)**
1. Récupérer les vraies clés Supabase depuis le dashboard
2. Configurer les variables d'environnement
3. Tester localement avec `npm run switch:prod`

### Phase 2: **Déploiement (15 min)**
1. Choisir la plateforme (Vercel recommandé)
2. Connecter le repo GitHub
3. Configurer les variables d'environnement sur la plateforme
4. Déclencher le déploiement

### Phase 3: **Post-déploiement (15 min)**
1. Tester toutes les fonctionnalités
2. Créer le premier compte admin
3. Configurer les paramètres email
4. Tests de charge basiques

## 📊 **État actuel**

### ✅ **Prêt**
- Code de production stable
- Supabase configuré et testé
- Interface utilisateur finalisée
- Authentification fonctionnelle
- Système multi-tenant opérationnel

### ⚠️ **À faire**
- Variables d'environnement production
- Déploiement sur l'hébergeur
- Configuration email production
- Tests en conditions réelles

## 🎯 **Estimation totale**

**Temps nécessaire :** ~1h
**Difficulté :** Facile (surtout de la configuration)
**Bloquants :** Aucun, tout est prêt côté code

## 🔑 **Étapes critiques**

1. **Clés Supabase** (5 min) - Récupérer depuis dashboard
2. **Variables prod** (10 min) - Configurer sur Vercel/Netlify  
3. **DB migration** (5 min) - `npx prisma db push`
4. **Premier déploiement** (10 min) - Push et test
5. **Tests finaux** (20 min) - Vérifier toutes les fonctions

**Vous êtes très proche de la prod ! 🎉**