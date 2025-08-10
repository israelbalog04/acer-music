# 🗄️ Configuration Prisma - Acer Music

## 📋 Vue d'ensemble

Ce projet utilise **Prisma** comme ORM (Object-Relational Mapping) pour gérer la base de données. La configuration actuelle utilise **SQLite** pour le développement local.

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Génération du client Prisma
```bash
npm run db:generate
```

### 3. Synchronisation de la base de données
```bash
npm run db:push
```

### 4. Ajout de données de test (optionnel)
```bash
npm run db:seed
```

### 5. Ouvrir Prisma Studio
```bash
npm run db:studio
```

## 📊 Structure de la Base de Données

### Modèles Principaux

#### 👤 User (Utilisateur)
- **id**: Identifiant unique
- **email**: Adresse email (unique)
- **firstName**: Prénom
- **lastName**: Nom
- **phone**: Téléphone (optionnel)
- **password**: Mot de passe hashé
- **role**: Rôle utilisateur (MUSICIEN, CHEF_LOUANGE, TECHNICIEN, ADMIN)
- **instruments**: Instruments joués (JSON string)
- **avatar**: URL de l'avatar (optionnel)

#### 🎵 Song (Chant)
- **id**: Identifiant unique
- **title**: Titre du chant
- **artist**: Artiste (optionnel)
- **key**: Clé musicale (optionnel)
- **bpm**: Tempo (optionnel)
- **duration**: Durée en secondes (optionnel)
- **lyrics**: Paroles (optionnel)
- **chords**: Accords (optionnel)
- **notes**: Notes (optionnel)
- **tags**: Tags (JSON string)
- **isActive**: Statut actif

#### 🎤 Recording (Enregistrement)
- **id**: Identifiant unique
- **title**: Titre de l'enregistrement
- **instrument**: Instrument utilisé
- **songId**: Référence au chant
- **audioUrl**: URL de l'audio (optionnel)
- **duration**: Durée en secondes (optionnel)
- **status**: Statut (DRAFT, IN_REVIEW, APPROVED, ARCHIVED)
- **notes**: Notes (optionnel)

#### 📅 Schedule (Planning)
- **id**: Identifiant unique
- **title**: Titre de l'événement
- **description**: Description (optionnel)
- **startTime**: Heure de début
- **endTime**: Heure de fin
- **type**: Type d'événement (REPETITION, SERVICE, CONCERT, FORMATION)
- **location**: Lieu (optionnel)
- **status**: Statut (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)

#### 👥 Team (Équipe)
- **id**: Identifiant unique
- **name**: Nom de l'équipe
- **description**: Description (optionnel)
- **color**: Couleur (optionnel)
- **isActive**: Statut actif

#### 🔗 TeamMember (Membre d'équipe)
- **id**: Identifiant unique
- **userId**: Référence à l'utilisateur
- **teamId**: Référence à l'équipe
- **scheduleId**: Référence au planning (optionnel)
- **joinedAt**: Date d'adhésion

## 🛠️ Commandes Utiles

### Scripts NPM
```bash
# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la base de données
npm run db:push

# Ajouter des données de test
npm run db:seed

# Ouvrir Prisma Studio
npm run db:studio
```

### Commandes Prisma Directes
```bash
# Voir l'état de la base de données
npx prisma db pull

# Créer une migration
npx prisma migrate dev

# Réinitialiser la base de données
npx prisma migrate reset

# Voir les logs de la base de données
npx prisma db seed --preview-feature
```

## 🔧 Configuration

### Fichier de Configuration
- **Schéma**: `prisma/schema.prisma`
- **Client**: `src/lib/prisma.ts`
- **Base de données**: `prisma/dev.db` (SQLite)

### Variables d'Environnement
```env
# Pour PostgreSQL (production)
DATABASE_URL="postgresql://user:password@localhost:5432/acer_music"

# Pour SQLite (développement)
DATABASE_URL="file:./dev.db"
```

## 📱 Utilisation dans l'Application

### Import du Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Exemples d'Utilisation

#### Créer un utilisateur
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: hashedPassword,
    role: 'MUSICIEN',
    instruments: JSON.stringify(['Piano', 'Guitare']),
  },
})
```

#### Récupérer les chants
```typescript
const songs = await prisma.song.findMany({
  where: { isActive: true },
  include: { recordings: true },
})
```

#### Créer un planning
```typescript
const schedule = await prisma.schedule.create({
  data: {
    title: 'Répétition',
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    type: 'REPETITION',
    status: 'PLANNED',
  },
})
```

## 🧪 Tests

### Page de Test
Accédez à `http://localhost:3000/test-db` pour tester la connexion à la base de données.

### Données de Test
Le script de seed crée :
- 1 utilisateur de test (`test@acer.com` / `password`)
- 3 chants classiques
- 1 équipe musicale
- 1 planning de répétition

## 🔄 Migration vers PostgreSQL

Pour passer en production avec PostgreSQL :

1. Modifier le `datasource` dans `schema.prisma` :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Configurer la variable d'environnement `DATABASE_URL`

3. Exécuter les migrations :
```bash
npx prisma migrate dev
```

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Prisma Studio](https://www.prisma.io/docs/concepts/tools/prisma-studio)
- [Migrations Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Client Prisma](https://www.prisma.io/docs/concepts/components/prisma-client) 