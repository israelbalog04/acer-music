# 👑 Système des Rôles Admin - ACER Music

## 🎯 **Vue d'Ensemble**

Le système de rôles dans ACER Music est hiérarchisé avec **ADMIN** comme rôle le plus privilégié. Les admins ont un contrôle total sur leur église et peuvent gérer tous les aspects de l'application.

## 🏛️ **Hiérarchie des Rôles**

### **1. ADMIN** 👑 (Niveau Supérieur)
- **Auto-approbation** : Comptes créés automatiquement approuvés
- **Accès total** : Toutes les fonctionnalités de l'application
- **Gestion complète** : Utilisateurs, événements, enregistrements, équipes
- **Multi-tenant** : Isolation par église

### **2. CHEF_LOUANGE** ⭐ (Niveau Intermédiaire)
- **Approbation requise** : Nécessite validation admin
- **Gestion musicale** : Répertoire, enregistrements, planning
- **Direction d'équipe** : Affectation de musiciens
- **Permissions étendues** : Mais pas d'accès aux paramètres système

### **3. MUSICIEN** 🎵 (Niveau Standard)
- **Approbation requise** : Nécessite validation admin
- **Accès limité** : Ses propres enregistrements et disponibilités
- **Consultation** : Planning, répertoire, équipes
- **Upload personnel** : Ses propres fichiers

### **4. TECHNICIEN** 🔧 (Niveau Standard)
- **Approbation requise** : Nécessite validation admin
- **Mêmes permissions** que MUSICIEN
- **Spécialisation** : Son, lumière, vidéo

### **5. MULTIMEDIA** 📸 (Niveau Spécialisé)
- **Approbation requise** : Nécessite validation admin
- **Accès limité** : Upload de photos uniquement
- **Interface simplifiée** : Page de dépôt dédiée

## 🛡️ **Permissions Admin Complètes**

### **Gestion des Utilisateurs**
```typescript
'users.read'           // Voir tous les utilisateurs
'users.create'         // Créer des comptes
'users.update'         // Modifier les profils
'users.delete'         // Supprimer des comptes
```

### **Gestion des Enregistrements**
```typescript
'recordings.read'      // Voir tous les enregistrements
'recordings.create'    // Créer des enregistrements
'recordings.update'    // Modifier les enregistrements
'recordings.delete'    // Supprimer les enregistrements
'recordings.approve'   // Approuver/refuser les enregistrements
```

### **Gestion du Répertoire**
```typescript
'songs.read'           // Voir le répertoire
'songs.create'         // Ajouter des chansons
'songs.update'         // Modifier les chansons
'songs.delete'         // Supprimer des chansons
```

### **Gestion du Planning**
```typescript
'schedules.read'       // Voir le planning
'schedules.create'     // Créer des événements
'schedules.update'     // Modifier les événements
'schedules.delete'     // Supprimer des événements
```

### **Gestion des Équipes**
```typescript
'teams.read'           // Voir les équipes
'teams.create'         // Créer des équipes
'teams.update'         // Modifier les équipes
'teams.delete'         // Supprimer des équipes
```

### **Gestion des Disponibilités**
```typescript
'availabilities.read'  // Voir toutes les disponibilités
'availabilities.create' // Créer des disponibilités
'availabilities.update' // Modifier les disponibilités
'availabilities.delete' // Supprimer les disponibilités
```

### **Analytics et Paramètres**
```typescript
'analytics.read'       // Voir les statistiques
'settings.read'        // Voir les paramètres
'settings.update'      // Modifier les paramètres
```

### **Gestion des Séquences**
```typescript
'sequences.read'       // Voir les séquences
'sequences.create'     // Créer des séquences
'sequences.update'     // Modifier les séquences
'sequences.delete'     // Supprimer les séquences
'sequences.download'   // Télécharger les séquences
```

### **Multimédia**
```typescript
'multimedia.images.read' // Voir les photos des musiciens
```

## 🧭 **Navigation Admin**

### **Section Administration**
- **Utilisateurs** : `/app/admin/users` - Gestion des comptes
- **Gestion des Événements** : `/app/admin/events` - Planning complet
- **Validation Enregistrements** : `/app/admin/recordings` - Approuver/refuser
- **Statistiques** : `/app/admin/analytics` - Tableaux de bord
- **Paramètres** : `/app/admin/settings` - Configuration système
- **Demandes d'Approval** : `/app/admin/pending-approvals` - Nouveaux utilisateurs

### **Section Musique**
- **Répertoire** : `/app/music/repertoire` - Gestion des chansons
- **Séquences** : `/app/music/sequences` - Fichiers de partition
- **Tous les Enregistrements** : `/app/music/all-recordings` - Bibliothèque complète
- **Upload** : `/app/music/upload` - Ajouter des fichiers
- **Photos des Musiciens** : `/app/music/photos` - Galerie photos

### **Section Équipe**
- **Planning** : `/app/team/planning` - Vue d'ensemble
- **Directeurs Musicaux** : `/app/planning/directors` - Gestion des directeurs
- **Équipes par Événement** : `/app/team/events` - Affectations
- **Membres** : `/app/team/members` - Annuaire
- **Disponibilités Équipe** : `/app/team/availability` - Planning des dispos
- **Disponibilités Membres** : `/app/admin/availability` - Vue admin
- **Affectation Équipes** : `/app/admin/teams/assign` - Gestion des équipes

## 🔐 **Sécurité et Contrôles**

### **Isolation Multi-Tenant**
- Chaque admin ne gère que sa propre église
- Impossible d'accéder aux données d'autres églises
- Validation stricte des `churchId`

### **Validation des Sessions**
```typescript
// Vérification du rôle admin
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
}

// Vérification de l'église
if (userToApprove.churchId !== session.user.churchId) {
  return NextResponse.json({ error: "Église différente" }, { status: 403 });
}
```

### **Auto-Approval des Admins**
```typescript
// Les admins sont automatiquement approuvés
const isApproved = userRole === UserRole.ADMIN;

// Création du compte
const user = await prisma.user.create({
  data: {
    // ... autres champs
    isApproved: isApproved, // Auto-approuvé si admin
  }
});
```

## 📊 **Fonctionnalités Admin Spécifiques**

### **1. Gestion des Demandes d'Approval**
- **Page** : `/app/admin/pending-approvals`
- **Fonctionnalités** :
  - Voir tous les utilisateurs en attente
  - Approuver/refuser avec un clic
  - Informations détaillées des demandeurs
  - Notifications automatiques

### **2. Validation des Enregistrements**
- **Page** : `/app/admin/recordings`
- **Fonctionnalités** :
  - Voir tous les enregistrements
  - Approuver/refuser/archiver
  - Commentaires et feedback
  - Historique des validations

### **3. Gestion des Événements**
- **Page** : `/app/admin/events`
- **Fonctionnalités** :
  - Créer/modifier/supprimer des événements
  - Affecter des directeurs musicaux
  - Gérer les équipes par événement
  - Planning complet

### **4. Statistiques et Analytics**
- **Page** : `/app/admin/analytics`
- **Fonctionnalités** :
  - Statistiques d'utilisation
  - Activité des utilisateurs
  - Performance des équipes
  - Rapports détaillés

## 🚀 **Création d'un Compte Admin**

### **Via l'Interface Web**
1. Aller sur `/auth/register`
2. Sélectionner le rôle "Administrateur"
3. Remplir le formulaire
4. Le compte est automatiquement approuvé
5. Connexion immédiate possible

### **Via Script**
```bash
# Créer un admin pour une église spécifique
npm run create-admin

# Créer des admins pour toutes les églises de test
npm run add-test-churches
```

### **Comptes Admin de Test**
- **admin@acer-paris.com** (password)
- **admin@acer-lyon.com** (password)
- **admin@acer-marseille.com** (password)
- **admin@acer-toulouse.com** (password)

## 🔄 **Workflow Admin Typique**

### **1. Gestion des Nouveaux Utilisateurs**
```
Nouvelle inscription → Notification admin → Consultation demande → Approuver/Refuser → Notification utilisateur
```

### **2. Validation des Enregistrements**
```
Musicien upload → Enregistrement en attente → Admin consulte → Approuver/Refuser/Archiver → Notification musicien
```

### **3. Gestion des Événements**
```
Créer événement → Affecter directeur → Assigner équipe → Gérer disponibilités → Suivre participation
```

## 🎯 **Bonnes Pratiques Admin**

### **Sécurité**
- ✅ Vérifier toujours l'identité avant d'approuver
- ✅ Utiliser des mots de passe forts
- ✅ Ne pas partager les accès admin
- ✅ Surveiller les activités suspectes

### **Gestion**
- ✅ Répondre rapidement aux demandes d'approval
- ✅ Donner du feedback constructif
- ✅ Maintenir le répertoire à jour
- ✅ Organiser régulièrement les équipes

### **Communication**
- ✅ Informer les utilisateurs des décisions
- ✅ Expliquer les refus avec bienveillance
- ✅ Encourager la participation
- ✅ Maintenir une communauté active

## 🎉 **Résumé des Avantages Admin**

### **Contrôle Total**
- ✅ Gestion complète de l'église
- ✅ Approbation de tous les contenus
- ✅ Configuration système
- ✅ Accès aux statistiques

### **Efficacité**
- ✅ Interface dédiée et optimisée
- ✅ Notifications automatiques
- ✅ Actions en lot possibles
- ✅ Workflows simplifiés

### **Sécurité**
- ✅ Isolation multi-tenant
- ✅ Validation stricte des permissions
- ✅ Traçabilité complète
- ✅ Contrôle d'accès granulaire

**🎊 Le système de rôles admin offre un contrôle total et sécurisé sur votre église ACER Music !**
