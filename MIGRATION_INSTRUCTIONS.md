# 🚨 MIGRATION URGENTE - Table event_messages manquante

## Problème
```
The table `public.event_messages` does not exist in the current database.
```

## Solution immédiate

### Option 1 : Supabase SQL Editor (RECOMMANDÉ)

1. **Ouvrir** [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. **Sélectionner** votre projet `butlptmveyaluxlnwizr`
3. **Aller** dans **SQL Editor**
4. **Copier-coller** le contenu de `scripts/create-event-messages-table.sql`
5. **Exécuter** le script
6. **Vérifier** que la table est créée

### Option 2 : Variables d'environnement

Si vous avez le vrai mot de passe Supabase :

```bash
# Mettre la vraie DATABASE_URL dans .env
DATABASE_URL="postgresql://postgres:[VRAI_PASSWORD]@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres"

# Puis exécuter
npx prisma db push --force-reset
```

### Option 3 : Via Vercel Variables

1. **Aller** dans Vercel Dashboard
2. **Settings** → **Environment Variables**
3. **Vérifier** que `DATABASE_URL` est correcte
4. **Redéployer** l'application

## Vérification

Une fois la migration faite :

```sql
-- Dans Supabase SQL Editor, vérifier :
SELECT COUNT(*) FROM event_messages;
-- Doit retourner 0 (table vide mais créée)
```

## Script SQL complet

Le fichier `scripts/create-event-messages-table.sql` contient :

- ✅ Création de l'enum `MessageType`
- ✅ Création de la table `event_messages`
- ✅ Tous les index nécessaires
- ✅ Contraintes de clés étrangères
- ✅ Trigger pour `updatedAt`
- ✅ Gestion des erreurs

## Après la migration

Le chat fonctionnera immédiatement :
- ✅ Envoi de messages
- ✅ Affichage en temps réel
- ✅ Système de réponses
- ✅ Modification/suppression

## Contact

Si problème, utilisez la page `/debug/chat` pour tester les APIs.