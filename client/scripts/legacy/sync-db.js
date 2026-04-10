const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Manual Database Sync Started ---');
  
  try {
    // 1. Create the ProductCategory enum if it doesn't exist
    console.log('Step 1: Creating ProductCategory enum type if missing...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TYPE "ProductCategory" AS ENUM (
          'CHEMICALS', 'MACHINES', 'TEXTILES', 'MEDICAL', 'HANDICRAFTS', 
          'FOOD', 'ELECTRONICS', 'AUTOMOTIVE', 'CONSTRUCTION', 'AGRICULTURE', 'OTHER'
        );
      `);
    } catch (e) {
      console.log('ProductCategory type might already exist, skipping...');
    }

    // 2. Add missing columns to 'products' table
    console.log('Step 2: Adding missing columns (regularPrice, quantity)...');
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "regularPrice" DOUBLE PRECISION DEFAULT 0;`);
    } catch (e) { console.log('regularPrice column error:', e.message); }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 0;`);
    } catch (e) { console.log('quantity column error:', e.message); }

    // 3. Convert 'category' column to 'ProductCategory' enum
    console.log('Step 3: Casting category column to ProductCategory enum...');
    
    // Mapping existing data to valid enum values first if necessary
    await prisma.$executeRawUnsafe(`
      UPDATE "products" SET "category" = 'OTHER' WHERE "category" NOT IN (
        'CHEMICALS', 'MACHINES', 'TEXTILES', 'MEDICAL', 'HANDICRAFTS', 
        'FOOD', 'ELECTRONICS', 'AUTOMOTIVE', 'CONSTRUCTION', 'AGRICULTURE', 'OTHER'
      );
    `);

    // Cast column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "products" ALTER COLUMN "category" TYPE "ProductCategory" USING "category"::"ProductCategory";
    `);

    console.log('--- Database Sync Completed Successfully ---');
  } catch (error) {
    console.error('--- Database Sync Failed ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
