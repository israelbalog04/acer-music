# 🚀 Guide de Déploiement - ACER Music

## Nouveautés v1.2

✨ **Chat par événement** : Système de messagerie intégré à chaque événement
🔧 **Fix permissions** : Correction des erreurs 403 sur la création d'événements
🎨 **UX améliorée** : Boutons harmonisés et notifications mieux positionnées

## Pré-requis Production

### 1. Base de données PostgreSQL
- Supabase (recommandé) ou autre provider PostgreSQL
- Connection pooling configuré
- Backup automatique activé

### 2. Variables d'environnement
Copier `.env.production` et configurer :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="votre-clé-secrète-forte"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key"

# Config
NODE_ENV="production"
STORAGE_TYPE="supabase"
```

## Étapes de Déploiement

### Option A : Déploiement automatique (Vercel/Netlify)

1. **Push vers GitHub** :
   ```bash
   git add .
   git commit -m "feat: ajout du chat par événement"
   git push
   ```

2. **Configuration plateforme** :
   - Configurer les variables d'environnement
   - Le script `vercel-postbuild` s'exécutera automatiquement

### Option B : Déploiement manuel

1. **Build du projet** :
   ```bash
   npm run build
   ```

2. **Migration base de données** :
   ```bash
   npm run migrate-prod
   ```

3. **Seed initial** (si nouvelle installation) :
   ```bash
   npm run db:seed
   node scripts/create-default-church.js
   node scripts/create-super-admin.js
   ```

## Vérifications Post-Déploiement

### 1. Santé de l'application
- [ ] Page d'accueil accessible
- [ ] Connexion utilisateur fonctionnelle
- [ ] Dashboard admin accessible

### 2. Nouvelles fonctionnalités
- [ ] Ouverture d'un événement affiche le bouton "Chat"
- [ ] Messages peuvent être envoyés/reçus
- [ ] Réponses aux messages fonctionnelles
- [ ] Permissions de modification/suppression

### 3. Base de données
- [ ] Table `event_messages` créée
- [ ] Relations avec `schedules`, `users`, `churches` actives
- [ ] Index et contraintes appliqués

## Rollback si Problème

Si problème majeur, rollback rapide :

```bash
# Revenir à la version précédente
git revert HEAD
git push

# Ou revenir à un commit spécifique
git reset --hard [COMMIT_PRÉCÉDENT]
git push --force
```

## Monitoring

### Métriques à surveiller
- Temps de réponse API chat (`/api/events/[id]/messages`)
- Utilisation base de données (nouvelles tables)
- Erreurs 403 résolues sur bulk events

### Logs importants
```bash
# Erreurs de chat
grep "Erreur lors de la création du message" logs/

# Succès de migration
grep "Migration terminée avec succès" logs/
```

## Support Utilisateurs

### Nouvelles fonctionnalités à communiquer
1. **Chat par événement** accessible depuis la page de détail
2. **Messages** avec réponses et modifications possibles
3. **Notifications** mieux positionnées dans l'interface

### Formation admins
- Comment modérer les messages (suppression)
- Gestion des événements avec le nouveau chat
- Utilisation des nouveaux boutons harmonisés

---

## Contact Support
- **Issues** : https://github.com/israelbalog04/acer-music/issues
- **Documentation** : Voir README.md
- **Emergency** : Contacter l'équipe technique

🎉 **Bonne utilisation d'ACER Music v1.2 !**