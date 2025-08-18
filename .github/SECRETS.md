# 🔐 Configuration des Secrets GitHub

Pour que le pipeline fonctionne, configurez ces secrets dans **Settings > Secrets and variables > Actions** :

## 🗄️ Base de données
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres
```

## 🔑 NextAuth
```
NEXTAUTH_URL = https://acer-music.vercel.app
NEXTAUTH_SECRET = production-secret-key-very-secure-2025-acer-music
```

## 📦 Supabase
```
NEXT_PUBLIC_SUPABASE_URL = https://butlptmveyaluxlnwizr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM
```

## 🚀 Vercel (pour auto-deploy)
```
VERCEL_TOKEN = [Token depuis Vercel Dashboard]
VERCEL_ORG_ID = [Organization ID]
VERCEL_PROJECT_ID = [Project ID]
```

## 💡 Comment obtenir les tokens Vercel :

1. **VERCEL_TOKEN** : 
   - Allez sur https://vercel.com/account/tokens
   - Créez un nouveau token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID** :
   - Dans votre projet Vercel > Settings > General
   - Copiez les IDs affichés