import { PrismaClient } from '@prisma/client';
import { getDatabaseUrlWithPgBouncer } from '@/lib/db-url';

// Configuration du pool de connexions pour Supabase
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuration optimisée pour plusieurs connexions simultanées
function createPrismaClientWithPool() {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrlWithPgBouncer()
      }
    },
    // Configuration du pool de connexions
    log: process.env.NODE_ENV === 'development' ? [
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ] : [
      {
        emit: 'stdout',
        level: 'error',
      }
    ],
  });
}

// Client Prisma avec pool de connexions
export const prisma = globalForPrisma.prisma ?? createPrismaClientWithPool();

// Fonction pour nettoyer et reconnecter en cas d'erreur de prepared statement
export async function handlePrismaConnection() {
  try {
    await prisma.$connect();
  } catch (error: any) {
    console.error('❌ Erreur de connexion Prisma:', error.message);
    
    // Si c'est une erreur de prepared statement, on force la reconnexion
    if (error.message?.includes('prepared statement') || error.message?.includes('already exists')) {
      console.log('🔄 Nettoyage des connexions pour résoudre les prepared statements...');
      
      try {
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
        await prisma.$connect();
        console.log('✅ Reconnexion réussie');
      } catch (reconnectError) {
        console.error('❌ Échec de la reconnexion:', reconnectError);
        throw reconnectError;
      }
    } else {
      throw error;
    }
  }
}

// Log des requêtes en développement (commenté pour éviter les erreurs de typage)
// if (process.env.NODE_ENV === 'development') {
//   prisma.$on('query', (e: any) => {
//     console.log('🔍 Query:', e.query);
//     console.log('⏱️  Duration:', e.duration + 'ms');
//     console.log('🌊 Connection Pool Active');
//   });
// }

// Gestion des erreurs de connexion (commenté pour éviter les erreurs de typage)
// prisma.$on('error', (e: any) => {
//   console.error('❌ Prisma Error:', e.message);
//   
//   if (e.message.includes('Can\'t reach database server')) {
//     console.log('🌊 Problème de connexion détecté - Pool de reconnexion...');
//   }
// });

// Pool de connexions avec gestion automatique
class ConnectionPool {
  private maxConnections: number;
  private activeConnections: number = 0;
  private connectionQueue: Array<() => void> = [];
  private isConnecting: boolean = false;

  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections;
  }

  // Obtenir une connexion du pool
  async getConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++;
        console.log(`🌊 Connexion obtenue (${this.activeConnections}/${this.maxConnections})`);
        resolve();
      } else {
        console.log(`⏳ Pool plein, connexion en attente (${this.activeConnections}/${this.maxConnections})`);
        this.connectionQueue.push(resolve);
      }
    });
  }

  // Libérer une connexion du pool
  releaseConnection(): void {
    this.activeConnections--;
    console.log(`🌊 Connexion libérée (${this.activeConnections}/${this.maxConnections})`);
    
    // Traiter la file d'attente
    if (this.connectionQueue.length > 0) {
      const nextConnection = this.connectionQueue.shift();
      if (nextConnection) {
        this.activeConnections++;
        console.log(`🌊 Connexion accordée depuis la file d'attente (${this.activeConnections}/${this.maxConnections})`);
        nextConnection();
      }
    }
  }

  // Obtenir les statistiques du pool
  getStats() {
    return {
      activeConnections: this.activeConnections,
      maxConnections: this.maxConnections,
      queuedConnections: this.connectionQueue.length,
      availableConnections: this.maxConnections - this.activeConnections
    };
  }
}

// Instance du pool de connexions optimisé pour Supabase pooler
const maxConnections = process.env.NODE_ENV === 'production' 
  ? parseInt(process.env.DB_POOL_SIZE || '20')  // 20 pour Supabase pooler
  : 10; // 10 en dev

const connectionPool = new ConnectionPool(maxConnections);

// Fonction wrapper avec gestion du pool
export async function withConnectionPool<T>(
  operation: () => Promise<T>,
  timeout: number = 30000 // 30 secondes de timeout
): Promise<T> {
  await connectionPool.getConnection();
  
  try {
    // Timeout pour éviter les connexions bloquées
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de connexion')), timeout)
      )
    ]);
    
    return result;
  } finally {
    connectionPool.releaseConnection();
  }
}

// Fonction avec retry et pool
export async function withRetryAndPool<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withConnectionPool(operation);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`❌ Toutes les tentatives ont échoué (${maxRetries}/${maxRetries})`);
        throw lastError;
      }
      
      // Si c'est une erreur de connexion ou de prepared statement, on attend avant de réessayer
      if (error instanceof Error && 
          (error.message.includes('Can\'t reach database server') ||
           error.message.includes('pooler') ||
           error.message.includes('connection') ||
           error.message.includes('Timeout') ||
           error.message.includes('prepared statement') ||
           error.message.includes('already exists'))) {
        
        const waitTime = delay * attempt;
        console.log(`⏳ Tentative ${attempt}/${maxRetries} échouée. Attente de ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Tentative de reconnexion avec gestion des prepared statements
        try {
          await handlePrismaConnection();
          console.log('✅ Reconnexion réussie');
        } catch (reconnectError) {
          console.log('⚠️  Échec de la reconnexion, continuation...');
        }
      } else {
        throw error;
      }
    }
  }
  
  throw lastError!;
}

// Client Prisma avec pool et retry
export const pooledPrisma = {
  // User operations avec pool
  user: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.user.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.user.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.user.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.user.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.user.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.user.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.user.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.user.count(args)),
  },
  
  // Church operations avec pool
  church: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.church.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.church.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.church.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.church.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.church.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.church.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.church.count(args)),
  },
  
  // Song operations avec pool
  song: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.song.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.song.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.song.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.song.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.song.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.song.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.song.count(args)),
  },
  
  // Recording operations avec pool
  recording: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.recording.findUnique(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.recording.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.recording.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.recording.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.recording.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.recording.count(args)),
  },
  
  // Schedule operations avec pool
  schedule: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.schedule.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.schedule.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.schedule.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.schedule.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.schedule.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.schedule.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.schedule.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.schedule.count(args)),
    groupBy: (args: any) => withRetryAndPool(() => prisma.schedule.groupBy(args)),
  },
  
  // Team operations avec pool
  team: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.team.findUnique(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.team.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.team.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.team.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.team.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.team.count(args)),
  },
  
  // EventTeamMember operations avec pool
  eventTeamMember: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.eventTeamMember.count(args)),
  },
  
  // EventDirector operations avec pool
  eventDirector: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.eventDirector.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.eventDirector.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.eventDirector.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.eventDirector.create(args)),
    createMany: (args: any) => withRetryAndPool(() => prisma.eventDirector.createMany(args)),
    update: (args: any) => withRetryAndPool(() => prisma.eventDirector.update(args)),
    updateMany: (args: any) => withRetryAndPool(() => prisma.eventDirector.updateMany(args)),
    upsert: (args: any) => withRetryAndPool(() => prisma.eventDirector.upsert(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.eventDirector.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.eventDirector.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.eventDirector.count(args)),
  },
  
  // EventSong operations avec pool
  eventSong: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.eventSong.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.eventSong.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.eventSong.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.eventSong.create(args)),
    createMany: (args: any) => withRetryAndPool(() => prisma.eventSong.createMany(args)),
    update: (args: any) => withRetryAndPool(() => prisma.eventSong.update(args)),
    updateMany: (args: any) => withRetryAndPool(() => prisma.eventSong.updateMany(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.eventSong.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.eventSong.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.eventSong.count(args)),
    aggregate: (args: any) => withRetryAndPool(() => prisma.eventSong.aggregate(args)),
  },
  
  // EventSession operations avec pool
  eventSession: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.eventSession.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.eventSession.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.eventSession.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.eventSession.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.eventSession.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.eventSession.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.eventSession.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.eventSession.count(args)),
  },
  
  // SessionMember operations avec pool
  sessionMember: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.sessionMember.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.sessionMember.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.sessionMember.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.sessionMember.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.sessionMember.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.sessionMember.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.sessionMember.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.sessionMember.count(args)),
  },
  
  // SessionDirector operations avec pool
  sessionDirector: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.sessionDirector.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.sessionDirector.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.sessionDirector.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.sessionDirector.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.sessionDirector.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.sessionDirector.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.sessionDirector.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.sessionDirector.count(args)),
  },
  
  // TeamMember operations avec pool
  teamMember: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.teamMember.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.teamMember.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.teamMember.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.teamMember.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.teamMember.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.teamMember.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.teamMember.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.teamMember.count(args)),
  },
  
  // SequenceDownload operations avec pool
  sequenceDownload: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.sequenceDownload.count(args)),
  },
  
  // Availability operations avec pool
  availability: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.availability.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.availability.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.availability.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.availability.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.availability.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.availability.delete(args)),
    deleteMany: (args: any) => withRetryAndPool(() => prisma.availability.deleteMany(args)),
    count: (args: any) => withRetryAndPool(() => prisma.availability.count(args)),
  },
  
  // Sequence operations avec pool
  sequence: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.sequence.findUnique(args)),
    findFirst: (args: any) => withRetryAndPool(() => prisma.sequence.findFirst(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.sequence.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.sequence.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.sequence.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.sequence.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.sequence.count(args)),
  },
  
  // Notification operations avec pool
  notification: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.notification.findUnique(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.notification.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.notification.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.notification.update(args)),
    updateMany: (args: any) => withRetryAndPool(() => prisma.notification.updateMany(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.notification.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.notification.count(args)),
  },
  
  // MusicianImage operations avec pool
  musicianImage: {
    findUnique: (args: any) => withRetryAndPool(() => prisma.musicianImage.findUnique(args)),
    findMany: (args: any) => withRetryAndPool(() => prisma.musicianImage.findMany(args)),
    create: (args: any) => withRetryAndPool(() => prisma.musicianImage.create(args)),
    update: (args: any) => withRetryAndPool(() => prisma.musicianImage.update(args)),
    delete: (args: any) => withRetryAndPool(() => prisma.musicianImage.delete(args)),
    count: (args: any) => withRetryAndPool(() => prisma.musicianImage.count(args)),
  },
  
  // Transaction operations avec pool
  $transaction: (args: any) => withRetryAndPool(() => prisma.$transaction(args)),
  
  // Connection management
  $connect: () => prisma.$connect(),
  $disconnect: () => prisma.$disconnect(),
  
  // Raw queries avec pool
  $queryRaw: (args: any) => withRetryAndPool(() => prisma.$queryRaw(args)),
  $executeRaw: (args: any) => withRetryAndPool(() => prisma.$executeRaw(args)),
  
  // Statistiques du pool
  getPoolStats: () => connectionPool.getStats(),
};

// Fonction pour tester les connexions simultanées
export async function testConcurrentConnections(count: number = 10) {
  console.log(`🧪 Test de ${count} connexions simultanées...`);
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    promises.push(
      pooledPrisma.user.count({}).then(result => {
        console.log(`✅ Connexion ${i + 1} réussie: ${result} utilisateurs`);
        return result;
      }).catch(error => {
        console.error(`❌ Connexion ${i + 1} échouée:`, error.message);
        throw error;
      })
    );
  }
  
  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`🎉 Toutes les ${count} connexions réussies en ${duration}ms`);
    console.log('📊 Statistiques du pool:', connectionPool.getStats());
    
    return results;
  } catch (error) {
    console.error('❌ Erreur lors du test de connexions simultanées:', error);
    throw error;
  }
}

// Configuration pour le développement
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default pooledPrisma;
