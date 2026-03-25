const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exporters = await prisma.user.findMany({ where: { role: 'EXPORTER' } });
  
  if (exporters.length === 0) {
    console.log('No exporters found. PROFILE CREATION PENDING. Please refresh dashboard.');
    return;
  }

  let importer = await prisma.user.findFirst({ where: { role: 'IMPORTER' } });
  if (!importer) {
    importer = await prisma.user.create({
      data: {
        email: 'global-buyer@example.com',
        role: 'IMPORTER',
        businessName: 'Global Markets Ltd',
        country: 'Netherlands',
        verificationStatus: 'VERIFIED'
      }
    });
  }

  for (const exporter of exporters) {
    console.log(`Seeding for ${exporter.id} (${exporter.name})`);
    
    const product = await prisma.product.upsert({
      where: { id: 'test-product-' + exporter.id.slice(0,8) },
      update: {},
      create: {
        id: 'test-product-' + exporter.id.slice(0,8),
        exporterId: exporter.id,
        name: 'Precision Heavy Machinery X1',
        description: 'Advanced industrial export goods',
        category: 'Machines',
        b2bPrice: 24500.00,
        currency: 'USD',
        originCountry: 'India'
      }
    });

    const order = await prisma.order.create({
      data: {
        orderType: 'B2B',
        orderNumber: 'TEST-' + Date.now().toString().slice(-6),
        buyerId: importer.id,
        sellerId: exporter.id,
        productId: product.id,
        quantity: 1,
        unitPrice: 24500.00,
        totalPrice: 24500.00,
        currency: 'USD',
        orderStatus: 'SHIPPED',
        paymentStatus: 'PAID'
      }
    });

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: 'TRK-' + Date.now().toString().slice(-8),
        courierId: 'MAERSK-LOGISTICS-V3',
        origin: 'NHAVA_SHEVA',
        destination: 'ROTTERDAM',
        currentStatus: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'IN_TRANSIT',
        location: 'Indian Ocean / Arabian Sea',
        latitude: 14.28,
        longitude: 61.45,
        note: 'Vessel in corridor. Sensors active. Maintaining 18 knots.'
      }
    });
    
    console.log('Successfully seeded LIVE data for exporter.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
