import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Debug en production
if (process.env.NODE_ENV === 'production') {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql://'));
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  ...(process.env.NODE_ENV === 'production' && {
    connectionLimit: 1,
    transactionOptions: {
      timeout: 10000,
    },
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?sslmode=require&connect_timeout=60`,
      },
    },
  }),
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;