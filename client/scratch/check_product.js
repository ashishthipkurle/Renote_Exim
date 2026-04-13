const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = '5a8b5105-cc59-4f17-a6fb-b319a7f77d07';
  console.log(`Searching for product ID: ${id}`);
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        exporter: true
      }
    });
    
    if (product) {
      console.log('Product found:');
      console.log(JSON.stringify(product, null, 2));
    } else {
      console.log('Product not found.');
    }
  } catch (error) {
    console.error('Error searching for product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
