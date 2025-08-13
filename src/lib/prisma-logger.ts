import { PrismaClient } from '@prisma/client';

// Logger personnalisé pour Prisma
const prismaLogger = {
  query: (e: any) => {
    console.log('🔍 SQL Query:', e.query);
    console.log('📊 Params:', e.params);
    console.log('⏱️ Duration:', e.duration + 'ms');
    console.log('---');
  },
  info: (e: any) => {
    console.log('ℹ️ Prisma Info:', e);
  },
  warn: (e: any) => {
    console.log('⚠️ Prisma Warning:', e);
  },
  error: (e: any) => {
    console.log('❌ Prisma Error:', e);
  },
};

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Écouter les événements de log
prisma.$on('query', prismaLogger.query);
prisma.$on('info', prismaLogger.info);
prisma.$on('warn', prismaLogger.warn);
prisma.$on('error', prismaLogger.error);
