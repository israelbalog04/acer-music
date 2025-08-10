# Guide - Gestion du Répertoire d'Événement

## Vue d'ensemble

La fonctionnalité de gestion du répertoire d'événement permet aux administrateurs et chefs de louange d'ajouter, supprimer et organiser les chansons pour chaque événement.

## Accès

### Via le modal de gestion d'événement
1. Aller dans **Administration > Gestion des Événements**
2. Cliquer sur l'icône crayon (Gérer l'événement) d'un événement
3. Cliquer sur **"Gérer le Répertoire"** dans la section Répertoire

### Via l'URL directe
```
/app/planning/events/[eventId]/repertoire
```

## Fonctionnalités

### 1. Affichage du répertoire actuel
- Liste des chansons ajoutées à l'événement
- Ordre numérique (1, 2, 3...)
- Informations de chaque chanson (titre, artiste, clé)
- Bouton de suppression pour chaque chanson

### 2. Ajout de chansons
- Modal de sélection avec recherche
- Liste de toutes les chansons disponibles du répertoire
- Filtrage en temps réel par titre ou artiste
- Sélection multiple de chansons
- Indication des chansons déjà ajoutées
- Informations détaillées (clé, BPM, durée)

### 3. Suppression de chansons
- Bouton de suppression individuel
- Confirmation automatique
- Mise à jour immédiate de la liste

### 4. Informations de l'événement
- Titre, date et heure de l'événement
- Type d'événement
- Description (si disponible)

## Permissions

### Rôles autorisés
- **ADMIN** : Accès complet
- **CHEF_LOUANGE** : Accès complet

### Rôles non autorisés
- **MUSICIEN** : Accès refusé
- **TECHNICIEN** : Accès refusé
- **MULTIMEDIA** : Accès refusé

## APIs utilisées

### GET `/api/admin/events/[eventId]`
- Récupère les informations de l'événement
- Vérifie les permissions d'accès

### GET `/api/songs`
- Récupère toutes les chansons actives du répertoire
- Filtrage par église automatique

### GET `/api/events/[eventId]/songs`
- Récupère les chansons actuellement dans l'événement
- Inclut les détails de chaque chanson

### POST `/api/events/[eventId]/songs`
- Ajoute des chansons à l'événement
- Gère automatiquement l'ordre
- Évite les doublons

### DELETE `/api/events/[eventId]/songs/[songId]`
- Supprime une chanson de l'événement
- Vérifie les permissions

### PUT `/api/events/[eventId]/songs/[songId]`
- Met à jour l'ordre d'une chanson
- Permet le réordonnancement

## Structure des données

### Modèle EventSong
```typescript
interface EventSong {
  id: string;
  songId: string;
  scheduleId: string; // ID de l'événement
  order: number;      // Ordre dans la liste
  key?: string;       // Tonalité spécifique
  notes?: string;     // Notes spécifiques
  churchId: string;   // Église
  song: Song;         // Détails de la chanson
}
```

### Modèle Song
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  key?: string;
  bpm?: number;
  duration?: number;
  notes?: string;
  tags?: string;
}
```

## Interface utilisateur

### Design moderne
- Modal avec backdrop flou
- Animations et transitions fluides
- Icônes et couleurs cohérentes
- Responsive design

### Fonctionnalités UX
- Recherche en temps réel
- Sélection multiple avec checkboxes
- Indication visuelle des chansons déjà ajoutées
- Boutons d'action clairs
- Messages de confirmation

### Navigation
- Bouton "Retour" pour revenir en arrière
- Breadcrumb implicite via l'URL
- Intégration avec le modal de gestion d'événement

## Cas d'usage

### 1. Création d'un nouveau répertoire
1. Accéder à la page de gestion du répertoire
2. Cliquer sur "Ajouter des Chansons"
3. Rechercher et sélectionner les chansons
4. Cliquer sur "Ajouter X chanson(s)"
5. Vérifier l'ordre dans la liste

### 2. Modification d'un répertoire existant
1. Accéder à la page de gestion du répertoire
2. Supprimer les chansons non désirées
3. Ajouter de nouvelles chansons
4. Réorganiser l'ordre si nécessaire

### 3. Consultation du répertoire
1. Accéder à la page de gestion du répertoire
2. Consulter la liste des chansons
3. Voir les détails (clé, BPM, durée)

## Tests

### Script de test
```bash
node scripts/test-event-repertoire.js
```

### Vérifications automatiques
- Existence des événements
- Existence des chansons
- Relations EventSong
- Permissions utilisateur
- Structure des données

## Sécurité

### Vérifications côté serveur
- Authentification requise
- Vérification des permissions par rôle
- Filtrage par église (multi-tenant)
- Validation des données d'entrée

### Protection des données
- Accès uniquement aux données de l'église
- Vérification de l'existence des ressources
- Gestion des erreurs appropriée

## Maintenance

### Logs
- Erreurs d'authentification
- Erreurs de permissions
- Erreurs de base de données
- Actions d'ajout/suppression

### Monitoring
- Performance des APIs
- Utilisation de la fonctionnalité
- Erreurs utilisateur

## Évolutions futures

### Fonctionnalités prévues
- Réordonnancement par drag & drop
- Import/export de répertoires
- Templates de répertoires
- Statistiques d'utilisation
- Historique des modifications

### Améliorations UX
- Mode sombre
- Filtres avancés
- Tri par différents critères
- Recherche globale
- Suggestions automatiques
