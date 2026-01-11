import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const db = new Database(process.env.DATABASE_URL.replace('file:', ''));
const adapter = new PrismaBetterSqlite3(db);

const prisma = new PrismaClient({ adapter });

export default prisma;