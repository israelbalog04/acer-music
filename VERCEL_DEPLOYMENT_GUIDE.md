# Guide de Déploiement Vercel - ACER Music

## 🚀 Configuration Vercel avec Prisma

### Variables d'Environnement Requises

Dans votre projet Vercel, configurez ces variables d'environnement :

#### Base de Données
```
DATABASE_URL=postgresql://username:password@host:port/database
```

#### NextAuth
```
NEXTAUTH_SECRET=votre-secret-jwt
NEXTAUTH_URL=https://votre-domaine.vercel.app
```

#### Supabase (si utilisé)
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
```

### Configuration du Build

Le fichier `vercel.json` est configuré pour :
- Utiliser `npm run vercel-build` comme commande de build
- Générer automatiquement le Prisma Client
- Augmenter la durée maximale des fonctions API à 30 secondes

### Scripts de Build

```json
{
  "build": "prisma generate && next build",
  "vercel-build": "prisma generate && next build"
}
```

### Déploiement

1. **Connectez votre repository GitHub à Vercel**
2. **Configurez les variables d'environnement** dans Vercel Dashboard
3. **Déployez automatiquement** via GitHub Actions ou manuellement

### Résolution des Problèmes

#### Erreur Prisma Client
Si vous obtenez l'erreur "Prisma has detected that this project was built on Vercel":
- ✅ Le script `vercel-build` inclut `prisma generate`
- ✅ Le fichier `vercel.json` est configuré
- ✅ Vérifiez que `DATABASE_URL` est correct

#### Variables d'Environnement Manquantes
- ✅ Configurez toutes les variables dans Vercel Dashboard
- ✅ Redéployez après avoir ajouté les variables

### Monitoring

- Surveillez les logs de build dans Vercel Dashboard
- Vérifiez les variables d'environnement
- Testez les APIs après déploiement
