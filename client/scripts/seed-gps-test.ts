import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const exporters = await prisma.user.findMany({ where: { role: 'EXPORTER' } });
  let importer = await prisma.user.findFirst({ where: { role: 'IMPORTER' } });
  
  if (exporters.length === 0) {
    console.log('No exporters found. Refresh the dashboard as ASHISH to auto-create the profile.');
    return;
  }

  if (!importer) {
    console.log('No importer found. Creating a dummy one.');
    importer = await prisma.user.create({
      data: {
        email: 'test-importer@example.com',
        role: 'IMPORTER',
        businessName: 'Global Markets Ltd',
        country: 'Netherlands'
      }
    });
  }

  for (const exporter of exporters) {
    console.log(`Processing seed for Exporter: ${exporter.name || exporter.id}`);
    
    let product = await prisma.product.findFirst({ where: { exporterId: exporter.id } });
    if (!product) {
      console.log(`- Creating dummy product for ${exporter.id}`);
      product = await prisma.product.create({
        data: {
          exporterId: exporter.id,
          name: 'Industrial Machinery SPX',
          description: 'High precision industrial equipment',
          category: 'Machines',
          b2bPrice: 15000,
          currency: 'USD',
          originCountry: 'India'
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-LIVE-${Date.now()}-${exporter.id.slice(0,4)}`,
        orderType: 'B2B',
        buyerId: importer.id,
        sellerId: exporter.id,
        productId: product.id,
        quantity: 1,
        unitPrice: product.b2bPrice,
        totalPrice: product.b2bPrice,
        currency: 'USD',
        orderStatus: 'SHIPPED'
      }
    });

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: `TRK-LIVE-${Date.now()}-${exporter.id.slice(0,4)}`,
        courierId: 'Maersk Line',
        origin: 'NHAVA_SHEVA',
        destination: 'ROTTERDAM',
        currentStatus: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'IN_TRANSIT',
        location: 'Arabian Sea',
        latitude: 14.5,
        longitude: 62.0,
        description: 'Vessel maintaining speed. ETA Rotterdam unchanged.'
      }
    });
    
    console.log(`- Seeded LIVE shipment for ${exporter.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
