import { PrismaClient } from '@prisma/client';
import { getDatabaseUrlWithPgBouncer } from '@/lib/db-url';

// Configuration spécifique pour la production
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: getDatabaseUrlWithPgBouncer(),
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
