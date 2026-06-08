require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.xsbldsecvhvpfiifmuer:FyTs5HvfQuKJelFY@65.0.195.55:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  try {
    console.log("Attempting to connect to the database...");
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("Connection successful!", result);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
