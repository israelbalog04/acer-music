# 🔧 Guide de Dépannage - Corrections Next.js 15

## 📋 Vue d'ensemble

Ce guide documente les corrections apportées pour résoudre les erreurs de runtime dans Next.js 15, notamment les problèmes liés aux paramètres dynamiques et aux imports manquants.

## 🚨 Erreurs Corrigées

### 1. Erreur d'Import Manquant
```
Runtime ReferenceError: Can't find variable: XMarkIcon
```

**Cause** : Icône non importée dans le fichier `churches/page.tsx`

**Solution** : Ajout des imports manquants
```typescript
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UsersIcon,
  CalendarIcon,
  MusicalNoteIcon,
  XMarkIcon,  // ← Ajouté
  CheckIcon   // ← Ajouté
} from '@heroicons/react/24/outline';
```

### 2. Erreur de Paramètres Dynamiques
```
Error: Route "/api/super-admin/users/[userId]" used `params.userId`. 
`params` should be awaited before using its properties.
```

**Cause** : Dans Next.js 15, les paramètres dynamiques sont maintenant asynchrones

**Solution** : Mise à jour des types et utilisation de `await`

#### Avant (Next.js 14)
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params; // ❌ Erreur
}
```

#### Après (Next.js 15)
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ✅ Correct
}
```

## 🔧 Fichiers Corrigés

### 1. Interface Utilisateur
- **Fichier** : `src/app/app/super-admin/churches/page.tsx`
- **Correction** : Ajout des imports `XMarkIcon` et `CheckIcon`
- **Impact** : Résolution de l'erreur de runtime

### 2. APIs Super Admin
- **Fichier** : `src/app/api/super-admin/users/[userId]/route.ts`
- **Correction** : Mise à jour des types params et ajout de `await`
- **Méthodes** : PUT, DELETE

- **Fichier** : `src/app/api/super-admin/churches/[churchId]/route.ts`
- **Correction** : Mise à jour des types params et ajout de `await`
- **Méthodes** : PUT, DELETE

## 📝 Modèle de Correction

### Pour les Routes Dynamiques
```typescript
// ❌ Ancien format (Next.js 14)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}

// ✅ Nouveau format (Next.js 15)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

### Pour les Imports d'Icônes
```typescript
// ❌ Imports manquants
import { 
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// ✅ Imports complets
import { 
  BuildingOfficeIcon,
  UsersIcon,
  XMarkIcon,    // ← Ajouté si utilisé
  CheckIcon,    // ← Ajouté si utilisé
  PlusIcon      // ← Ajouté si utilisé
} from '@heroicons/react/24/outline';
```

## 🧪 Tests de Validation

### Script de Test
```bash
node scripts/test-fixes.js
```

### Vérifications Effectuées
1. **Imports d'icônes** : Vérification de la présence des imports
2. **Types params** : Vérification des types Promise
3. **Await params** : Vérification de l'utilisation de `await`
4. **Structure générale** : Vérification de la cohérence

## 🚀 Procédure de Correction

### 1. Identifier l'Erreur
```bash
# Dans les logs du serveur de développement
Error: Route "/api/..." used `params.xxx`. `params` should be awaited
```

### 2. Localiser le Fichier
```bash
# Chercher les fichiers avec des paramètres dynamiques
grep -r "const { .* } = params;" src/app/api/
```

### 3. Appliquer la Correction
```typescript
// Changer le type
{ params }: { params: Promise<{ id: string }> }

// Ajouter await
const { id } = await params;
```

### 4. Tester la Correction
```bash
# Redémarrer le serveur
npm run dev

# Vérifier que l'erreur a disparu
```

## 📊 APIs à Surveiller

### APIs Corrigées ✅
- `/api/super-admin/users/[userId]` (PUT, DELETE)
- `/api/super-admin/churches/[churchId]` (PUT, DELETE)

### APIs à Vérifier ⚠️
- `/api/events/[eventId]/songs/route.ts`
- `/api/events/[eventId]/songs/[songId]/route.ts`

### Pattern de Recherche
```bash
# Chercher les routes dynamiques non corrigées
grep -r "params: { .* }" src/app/api/ --include="*.ts"
```

## 🔍 Détection Automatique

### Script de Détection
```javascript
const fs = require('fs');
const path = require('path');

function findUnfixedParams() {
  const apiDir = 'src/app/api';
  const files = getAllFiles(apiDir);
  
  files.forEach(file => {
    if (file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Chercher les patterns problématiques
      const hasSyncParams = content.includes('params: {') && !content.includes('Promise<');
      const hasSyncDestructuring = content.includes('const {') && content.includes('} = params;') && !content.includes('await params');
      
      if (hasSyncParams || hasSyncDestructuring) {
        console.log(`⚠️ ${file} nécessite des corrections`);
      }
    }
  });
}
```

## 🎯 Bonnes Pratiques

### 1. Vérification des Imports
- **Avant d'utiliser** une icône, vérifier qu'elle est importée
- **Utiliser l'autocomplétion** de l'IDE pour éviter les erreurs
- **Vérifier les logs** de compilation pour détecter les imports manquants

### 2. Gestion des Paramètres
- **Toujours utiliser** `Promise<{...}>` pour les types de params
- **Toujours utiliser** `await params` pour la destructuration
- **Tester** les routes dynamiques après modification

### 3. Tests Automatisés
- **Créer des scripts** de test pour valider les corrections
- **Vérifier** la structure des fichiers après modification
- **Documenter** les changements apportés

## 📚 Ressources

### Documentation Officielle
- [Next.js 15 Migration Guide](https://nextjs.org/docs/upgrading)
- [Dynamic Route Segments](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

### Outils Utiles
- **ESLint** : Détection automatique des erreurs
- **TypeScript** : Vérification des types
- **Scripts de test** : Validation des corrections

## 🔮 Prévention

### Checklist de Vérification
- [ ] Tous les imports d'icônes sont présents
- [ ] Les types params utilisent `Promise<{...}>`
- [ ] La destructuration utilise `await params`
- [ ] Les tests passent sans erreur
- [ ] Le serveur démarre sans warning

### Monitoring Continu
- **Surveiller** les logs de développement
- **Tester** régulièrement les fonctionnalités
- **Mettre à jour** les scripts de test

---

*Ce guide sera mis à jour au fur et à mesure de la découverte de nouvelles erreurs et corrections.*
