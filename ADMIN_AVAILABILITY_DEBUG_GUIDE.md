# Guide de Diagnostic - Page Disponibilités Admin

## Problème
La page `/app/admin/availability` retourne une erreur 404 ou ne fonctionne pas correctement.

## Diagnostic

### 1. Vérification des données
✅ **Données présentes dans la base :**
- 7 utilisateurs ADMIN
- 7 musiciens/techniciens
- 12 événements actifs
- 29 disponibilités

### 2. Test des APIs
Utilisez la page de debug : `/app/admin/availability-debug`

Cette page teste les 3 APIs utilisées :
- `/api/admin/users`
- `/api/admin/events`
- `/api/admin/availability`

### 3. Logs de diagnostic
La page originale a été modifiée avec des logs détaillés :
- Statuts des réponses API
- Nombre de données reçues
- Traitement de chaque utilisateur

### 4. Étapes de diagnostic

#### Étape 1 : Test de la page de debug
1. Accédez à `/app/admin/availability-debug`
2. Vérifiez si toutes les APIs fonctionnent
3. Regardez les données détaillées

#### Étape 2 : Test de la page originale
1. Accédez à `/app/admin/availability`
2. Ouvrez la console du navigateur (F12)
3. Regardez les logs de diagnostic

#### Étape 3 : Vérification des erreurs
Si des erreurs apparaissent :
- Notez les codes d'erreur HTTP
- Vérifiez les messages d'erreur dans la console
- Vérifiez les logs du serveur

### 5. Solutions possibles

#### Problème d'authentification
- Vérifiez que l'utilisateur est bien connecté en tant qu'ADMIN
- Vérifiez que la session est valide

#### Problème de permissions
- Vérifiez que l'utilisateur a accès aux données de son église
- Vérifiez que les APIs respectent les permissions

#### Problème de données
- Vérifiez que les données sont dans le bon format
- Vérifiez que les relations entre les tables sont correctes

#### Problème de code
- Vérifiez que le code de traitement des données fonctionne
- Vérifiez que les filtres sont corrects

### 6. Commandes de test

```bash
# Test des données côté serveur
node scripts/test-admin-apis-server.js

# Test des disponibilités
node scripts/test-admin-availability.js
```

### 7. Fichiers concernés

- `src/app/admin/availability/page.tsx` - Page principale
- `src/app/admin/availability-debug/page.tsx` - Page de debug
- `src/app/api/admin/users/route.ts` - API utilisateurs
- `src/app/api/admin/events/route.ts` - API événements
- `src/app/api/admin/availability/route.ts` - API disponibilités

### 8. Navigation
La page est accessible via :
- Sidebar : "Disponibilités Membres" (section Admin)
- URL directe : `/app/admin/availability`

### 9. Permissions requises
- Rôle : `ADMIN`
- Permissions : `availabilities.read`

### 10. Données attendues
- Liste des musiciens et techniciens
- Événements actifs
- Disponibilités par utilisateur et événement
- Statistiques de disponibilité

## Résolution

Une fois le diagnostic effectué, les corrections seront appliquées selon le problème identifié.
