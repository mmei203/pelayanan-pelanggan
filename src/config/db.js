import 'dotenv/config';
import mariadb from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client.ts';

const pool = mariadb.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   port: Number(process.env.DB_PORT) || 4000,
   connectionLimit: 10,
   connectTimeout: 30000,
   ssl: {
      rejectUnauthorized: false
   }
});

const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };