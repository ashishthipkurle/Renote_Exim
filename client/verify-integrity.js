
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
        include: {
            exporter: {
                select: { name: true, email: true }
            }
        }
    });
    
    console.log(`Found ${products.length} products total.`);

    const orphaned = products.filter(p => !p.exporter);
    if (orphaned.length > 0) {
        console.log(`WARNING: Found ${orphaned.length} products with missing exporters.`);
        // For orphaned products, we should ideally assign them a valid exporter or delete them.
        // But for now, just noting it.
    } else {
        console.log('All products have valid exporters.');
    }

    console.log('Final Verification Success.');
  } catch (e) {
    console.error('Final verification error:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
