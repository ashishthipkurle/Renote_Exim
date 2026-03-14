
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const totalProductsSQL = await prisma.$queryRaw`SELECT count(*) FROM products`;
    const availableProductsSQL = await prisma.$queryRaw`SELECT count(*) FROM products WHERE available = true`;
    
    console.log('SQL Counts:');
    console.log('Total:', totalProductsSQL);
    console.log('Available:', availableProductsSQL);

    console.log('\nPrisma Counts:');
    const prismaTotal = await prisma.product.count().catch(err => {
        console.error('Prisma count total error:', err.message);
        return 'ERROR';
    });
    const prismaAvailable = await prisma.product.count({ where: { available: true } }).catch(err => {
        console.error('Prisma count available error:', err.message);
        return 'ERROR';
    });

    console.log('Total:', prismaTotal);
    console.log('Available:', prismaAvailable);

    if (prismaAvailable !== 'ERROR' && prismaAvailable > 0) {
        const products = await prisma.product.findMany({ where: { available: true }, take: 5 });
        console.log('\nPrisma Products (first 5):', JSON.stringify(products, null, 2));
    }

  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
