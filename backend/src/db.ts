import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var __prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;
const optimizedDatabaseUrl = databaseUrl ?
  `${databaseUrl}?connection_limit=2&pool_timeout=10&connect_timeout=30&statement_timeout=30000` :
  undefined;

const pool = new Pool({ connectionString: optimizedDatabaseUrl });
const adapter = new PrismaPg(pool);

const prisma = globalThis.__prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
