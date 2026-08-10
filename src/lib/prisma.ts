import { PrismaClient } from '@prisma/client';

const getCleanDatabaseUrl = () => {
  let url = process.env.DATABASE_URL || '';
  // Strip accidental outer quotes or whitespace
  url = url.trim().replace(/^["']|["']$/g, '');
  return url;
};

const databaseUrl = getCleanDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
