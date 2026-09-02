const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  try {
    // Check if the table exists
    const tables = await p.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'home_showcase_items'
    `);
    console.log('Table exists:', JSON.stringify(tables));

    if (tables.length === 0) {
      console.log('Table does NOT exist. Creating it...');
      await p.$queryRawUnsafe(`
        CREATE TABLE IF NOT EXISTS home_showcase_items (
          id TEXT NOT NULL DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          tag TEXT NOT NULL,
          category TEXT NOT NULL,
          "desc" TEXT NOT NULL,
          image TEXT NOT NULL,
          "orderIndex" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT home_showcase_items_pkey PRIMARY KEY (id)
        )
      `);
      console.log('Table created successfully!');
    }

    // Try fetching items
    const items = await p.homeShowcaseItem.findMany();
    console.log('Items count:', items.length);
    console.log('Items:', JSON.stringify(items, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

test();
