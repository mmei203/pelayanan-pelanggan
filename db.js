import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";

// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
   adapter,
   log: process.env.NODE_ENV === "development" ? ['query','error','warn'] : ['error']
});

const connectDB = async () => {
   try {
      await prisma.$connect();
      console.log("DB connected via Prisma");
   } catch (error) {
      console.error(`database connection error: ${error.message}`);
      process.exit(1);
   }
};

const disconnectDB = async () => {
   await prisma.$disconnect();
   await pool.end();
};

export { prisma, connectDB, disconnectDB };