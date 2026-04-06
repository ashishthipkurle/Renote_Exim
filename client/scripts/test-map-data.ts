import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: 'ASHISH', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('User Ashish not found');
    return;
  }

  console.log('User found:', user.id, user.role);

  const shipments = await prisma.shipment.findMany({
    where: {
      order: {
        sellerId: user.id
      }
    },
    include: {
      order: {
        include: {
          product: true,
          importer: true
        }
      },
      statusHistory: true
    }
  });

  console.log('Shipments for user:', shipments.length);
  shipments.forEach(s => {
    console.log(`- Shipment ${s.id}, Internal Status: ${s.currentStatus}, Order Status: ${s.order.orderStatus}`);
    console.log(`  Events: ${s.statusHistory.length}`);
    if (s.statusHistory.length > 0) {
      console.log(`  Latest Event Lat: ${s.statusHistory[0].latitude}, Lng: ${s.statusHistory[0].longitude}`);
    }
  });
}

test().catch(console.error).finally(() => prisma.$disconnect());
