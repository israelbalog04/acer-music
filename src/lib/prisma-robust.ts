import { PrismaClient } from '@prisma/client';
import { getDatabaseUrlWithPgBouncer } from '@/lib/db-url';

// Configuration robuste pour Prisma avec retry et gestion des déconnexions
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fonction pour créer un client Prisma avec retry
function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrlWithPgBouncer()
      }
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });
}

// Client Prisma avec gestion des déconnexions
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Log des requêtes en développement (commenté pour éviter les erreurs de typage)
// if (process.env.NODE_ENV === 'development') {
//   prisma.$on('query', (e) => {
//     console.log('🔍 Query:', e.query);
//     console.log('⏱️  Duration:', e.duration + 'ms');
//   });
// }

// Gestion des erreurs de connexion (commenté pour éviter les erreurs de typage)
// prisma.$on('error', (e) => {
//   console.error('❌ Prisma Error:', e.message);
//   
//   if (e.message.includes('Can\'t reach database server')) {
//     console.log('🌊 Problème de connexion détecté - Tentative de reconnexion...');
//     console.log('🌊 Problème de connexion détecté - Tentative de reconnexion...');
//   }
// });

// Fonction wrapper avec retry automatique
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Si c'est la dernière tentative, on relance l'erreur
      if (attempt === maxRetries) {
        console.error(`❌ Toutes les tentatives ont échoué (${maxRetries}/${maxRetries})`);
        throw lastError;
      }
      
      // Si c'est une erreur de connexion, on attend avant de réessayer
      if (error instanceof Error && 
          (error.message.includes('Can\'t reach database server') ||
           error.message.includes('pooler') ||
           error.message.includes('connection'))) {
        
        const waitTime = delay * attempt;
        console.log(`⏳ Tentative ${attempt}/${maxRetries} échouée. Attente de ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Tentative de reconnexion
        try {
          await prisma.$connect();
          console.log('✅ Reconnexion réussie');
        } catch (reconnectError) {
          console.log('⚠️  Échec de la reconnexion, continuation...');
        }
      } else {
        // Pour les autres erreurs, on relance immédiatement
        throw error;
      }
    }
  }
  
  throw lastError!;
}

// Fonctions utilitaires avec retry
export const robustPrisma = {
  // User operations
  user: {
    findUnique: (args: any) => withRetry(() => prisma.user.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.user.findMany(args)),
    create: (args: any) => withRetry(() => prisma.user.create(args)),
    update: (args: any) => withRetry(() => prisma.user.update(args)),
    delete: (args: any) => withRetry(() => prisma.user.delete(args)),
    count: (args: any) => withRetry(() => prisma.user.count(args)),
  },
  
  // Church operations
  church: {
    findUnique: (args: any) => withRetry(() => prisma.church.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.church.findMany(args)),
    create: (args: any) => withRetry(() => prisma.church.create(args)),
    update: (args: any) => withRetry(() => prisma.church.update(args)),
    delete: (args: any) => withRetry(() => prisma.church.delete(args)),
    count: (args: any) => withRetry(() => prisma.church.count(args)),
  },
  
  // Song operations
  song: {
    findUnique: (args: any) => withRetry(() => prisma.song.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.song.findMany(args)),
    create: (args: any) => withRetry(() => prisma.song.create(args)),
    update: (args: any) => withRetry(() => prisma.song.update(args)),
    delete: (args: any) => withRetry(() => prisma.song.delete(args)),
    count: (args: any) => withRetry(() => prisma.song.count(args)),
  },
  
  // Recording operations
  recording: {
    findUnique: (args: any) => withRetry(() => prisma.recording.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.recording.findMany(args)),
    create: (args: any) => withRetry(() => prisma.recording.create(args)),
    update: (args: any) => withRetry(() => prisma.recording.update(args)),
    delete: (args: any) => withRetry(() => prisma.recording.delete(args)),
    count: (args: any) => withRetry(() => prisma.recording.count(args)),
  },
  
  // Schedule operations
  schedule: {
    findUnique: (args: any) => withRetry(() => prisma.schedule.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.schedule.findMany(args)),
    create: (args: any) => withRetry(() => prisma.schedule.create(args)),
    update: (args: any) => withRetry(() => prisma.schedule.update(args)),
    delete: (args: any) => withRetry(() => prisma.schedule.delete(args)),
    count: (args: any) => withRetry(() => prisma.schedule.count(args)),
  },
  
  // Team operations
  team: {
    findUnique: (args: any) => withRetry(() => prisma.team.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.team.findMany(args)),
    create: (args: any) => withRetry(() => prisma.team.create(args)),
    update: (args: any) => withRetry(() => prisma.team.update(args)),
    delete: (args: any) => withRetry(() => prisma.team.delete(args)),
    count: (args: any) => withRetry(() => prisma.team.count(args)),
  },
  
  // Availability operations
  availability: {
    findUnique: (args: any) => withRetry(() => prisma.availability.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.availability.findMany(args)),
    create: (args: any) => withRetry(() => prisma.availability.create(args)),
    update: (args: any) => withRetry(() => prisma.availability.update(args)),
    delete: (args: any) => withRetry(() => prisma.availability.delete(args)),
    count: (args: any) => withRetry(() => prisma.availability.count(args)),
  },
  
  // Sequence operations
  sequence: {
    findUnique: (args: any) => withRetry(() => prisma.sequence.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.sequence.findMany(args)),
    create: (args: any) => withRetry(() => prisma.sequence.create(args)),
    update: (args: any) => withRetry(() => prisma.sequence.update(args)),
    delete: (args: any) => withRetry(() => prisma.sequence.delete(args)),
    count: (args: any) => withRetry(() => prisma.sequence.count(args)),
  },
  
  // Notification operations
  notification: {
    findUnique: (args: any) => withRetry(() => prisma.notification.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.notification.findMany(args)),
    create: (args: any) => withRetry(() => prisma.notification.create(args)),
    update: (args: any) => withRetry(() => prisma.notification.update(args)),
    delete: (args: any) => withRetry(() => prisma.notification.delete(args)),
    count: (args: any) => withRetry(() => prisma.notification.count(args)),
  },
  
  // MusicianImage operations
  musicianImage: {
    findUnique: (args: any) => withRetry(() => prisma.musicianImage.findUnique(args)),
    findMany: (args: any) => withRetry(() => prisma.musicianImage.findMany(args)),
    create: (args: any) => withRetry(() => prisma.musicianImage.create(args)),
    update: (args: any) => withRetry(() => prisma.musicianImage.update(args)),
    delete: (args: any) => withRetry(() => prisma.musicianImage.delete(args)),
    count: (args: any) => withRetry(() => prisma.musicianImage.count(args)),
  },
  
  // Transaction operations
  $transaction: (args: any) => withRetry(() => prisma.$transaction(args)),
  
  // Connection management
  $connect: () => prisma.$connect(),
  $disconnect: () => prisma.$disconnect(),
  
  // Raw queries
  $queryRaw: (args: any) => withRetry(() => prisma.$queryRaw(args)),
  $executeRaw: (args: any) => withRetry(() => prisma.$executeRaw(args)),
};

// Configuration pour le développement
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default robustPrisma;
