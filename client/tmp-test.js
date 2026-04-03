const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Granting INSERT privileges to anon and authenticated...');
  try {
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon, authenticated;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;`);
    console.log('Success! Permissions granted.');
  } catch(e) {
    console.error('Failure:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
