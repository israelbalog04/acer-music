# 🏛️ Guide du Système Multi-Tenant ACER

## 📖 Vue d'ensemble

Le système ACER Music supporte maintenant plusieurs églises avec isolation complète des données :

- **ACER Paris** 🗼
- **ACER Rennes** 🌊  
- **ACER Lyon** ⛰️

Chaque église a ses propres utilisateurs, répertoires, plannings, et enregistrements.

## 👥 Comptes de Test Créés

### Administrateurs
| Église | Email | Mot de passe | Rôle |
|--------|--------|--------------|------|
| **ACER Paris** | `admin@acer-paris.com` | `admin123` | ADMIN |
| **ACER Rennes** | `admin@acer-rennes.com` | `admin123` | ADMIN |
| **ACER Lyon** | `admin@acer-lyon.com` | `admin123` | ADMIN |

### Utilisateurs d'exemple (par église)
| Rôle | Paris | Rennes | Lyon | Mot de passe |
|------|-------|---------|------|--------------|
| **Chef de Louange** | `chef_louange@acer-paris.com` | `chef_louange@acer-rennes.com` | `chef_louange@acer-lyon.com` | `password123` |
| **Musicien** | `musicien@acer-paris.com` | `musicien@acer-rennes.com` | `musicien@acer-lyon.com` | `password123` |
| **Technicien** | `technicien@acer-paris.com` | `technicien@acer-rennes.com` | `technicien@acer-lyon.com` | `password123` |

## 🔧 Comment tester

### 1. Connexion par église
1. Allez sur `http://localhost:3002/auth/login`
2. Connectez-vous avec un compte d'une église
3. Vérifiez que le nom de l'église apparaît dans la sidebar

### 2. Isolation des données
1. Connectez-vous avec `admin@acer-paris.com`
2. Allez dans **Admin > Utilisateurs** : vous ne verrez que les utilisateurs de Paris
3. Allez dans **Musique > Répertoire** : vous ne verrez que les chansons de Paris
4. Déconnectez-vous et connectez-vous avec `admin@acer-rennes.com`
5. Répétez : vous verrez uniquement les données de Rennes

### 3. Test des rôles par église
1. **Admin** : Accès complet à la gestion de son église
2. **Chef de Louange** : Planning et événements de son église
3. **Musiciens** : Enregistrements et disponibilités de son église

## 📊 Données créées automatiquement

Chaque église a :
- ✅ 1 Administrateur
- ✅ 3 Utilisateurs d'exemple (Chef Louange, Musicien, Technicien)
- ✅ 3 Chansons de base (Amazing Grace, How Great Thou Art, Blessed Assurance)
- ✅ Isolation complète des données

## 🔒 Sécurité Multi-Tenant

### Filtrage automatique
- Toutes les requêtes sont automatiquement filtrées par `churchId`
- Un utilisateur ne peut voir que les données de son église
- Les API routes vérifient automatiquement l'appartenance à l'église

### Protection des données
- **Users** : Filtrés par église ✅
- **Songs** : Filtrés par église ✅
- **Recordings** : Filtrés par église ✅
- **Schedules** : Filtrés par église ✅
- **Teams** : Filtrés par église ✅
- **Availabilities** : Filtrés par église ✅

## 🛠️ Architecture technique

### Base de données
```sql
-- Toutes les tables ont maintenant un churchId
Church -> User, Song, Recording, Schedule, Team, Availability
```

### Middleware de filtrage
```typescript
// Utilisation côté serveur
const churchPrisma = await ChurchPrisma.create()
const users = await churchPrisma.findUsers()

// Filtrage automatique par churchId de l'utilisateur connecté
```

### Session enrichie
```typescript
// La session inclut maintenant :
session.user.churchId
session.user.churchName
session.user.churchCity
```

## 🎯 Prochaines étapes suggérées

1. **Interface de changement d'église** pour les super-admins
2. **Statistiques inter-églises** pour la direction nationale
3. **Partage de répertoire** entre églises (optionnel)
4. **Backup/export** par église
5. **Gestion des paramètres** spécifiques par église

## ⚠️ Important

- Changez les mots de passe par défaut après les premiers tests
- Chaque église est complètement isolée
- Les admins ne peuvent gérer que leur propre église
- L'isolation est garantie au niveau base de données