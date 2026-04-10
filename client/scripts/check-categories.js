const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const products = await prisma.product.findMany({ select: { category: true } });
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  console.log('Unique Categories in DB:', uniqueCategories);
  process.exit(0);
}

checkCategories().catch(e => {
  console.error(e);
  process.exit(1);
});
