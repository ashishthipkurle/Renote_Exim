const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const exporterId = 'clx0k6h123456789' // fake id just to see schema validation error
  try {
    const res1 = await prisma.product.count({ where: { exporterId } });
    console.log('res1 ok:', res1);
    
    const res2 = await prisma.order.count({
      where: {
        sellerId: exporterId,
        orderStatus: { in: ['QUOTE_REQUESTED', 'PO_RAISED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    });
    console.log('res2 ok:', res2);
    
    const res3 = await prisma.order.aggregate({
      where: {
        sellerId: exporterId,
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { totalPrice: true },
    });
    console.log('res3 ok:', res3);
    
    const res4 = await prisma.shipment.count({
      where: { order: { sellerId: exporterId } },
    });
    console.log('res4 ok:', res4);
  } catch (err) {
    console.error('Prisma Error:', err.message);
  } finally {
    await prisma.$disconnect()
  }
}

main()
