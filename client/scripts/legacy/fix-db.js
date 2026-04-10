
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const validCategories = [
      'CHEMICALS', 'MACHINES', 'TEXTILES', 'MEDICAL', 'HANDICRAFTS', 
      'FOOD', 'ELECTRONICS', 'AUTOMOTIVE', 'CONSTRUCTION', 'AGRICULTURE', 'OTHER'
    ];

    console.log('Validating categories...');
    
    // Find all unique categories in database
    const categoriesSQL = await prisma.$queryRaw`SELECT DISTINCT category FROM products`;
    const dbCategories = categoriesSQL.map(c => c.category);
    console.log('Categories in DB:', dbCategories);

    const invalidCategories = dbCategories.filter(c => !validCategories.includes(c));
    console.log('Invalid Categories:', invalidCategories);

    if (invalidCategories.length > 0) {
        // Update invalid categories to OTHER
        for (const invalid of invalidCategories) {
            await prisma.$executeRaw`UPDATE products SET category = 'OTHER' WHERE category = ${invalid}`;
            console.log(`Updated category ${invalid} to OTHER`);
        }
    }

    console.log('Category validation complete.');

    // Final test: try findMany again
    const products = await prisma.product.findMany({ take: 1 });
    console.log('Final Verification - Prisma can fetch products:', products.length > 0 ? 'YES' : 'NO');
    if (products.length > 0) {
        console.log('First Product:', products[0].name);
    }

  } catch (e) {
    console.error('Validation error:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
