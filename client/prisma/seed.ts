import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create Users
  const exporters = await Promise.all([
    prisma.user.upsert({
      where: { email: 'exporter1@example.com' },
      update: {},
      create: {
        email: 'exporter1@example.com',
        name: 'John Exporter',
        role: Role.EXPORTER,
        businessName: 'Global Trade Co',
        country: 'India',
        verificationStatus: 'VERIFIED',
      },
    }),
  ]);

  const importers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'importer1@example.com' },
      update: {},
      create: {
        email: 'importer1@example.com',
        name: 'Alice Importer',
        role: Role.IMPORTER,
        businessName: 'Import Solutions LLC',
        country: 'USA',
        verificationStatus: 'VERIFIED',
      },
    }),
  ]);

  console.log('Users created.');

  // 2. Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Industrial Valve A1',
        description: 'High pressure stainless steel industrial valve.',
        price: 450,
        category: 'Machines',
        minOrderQty: 10,
        unit: 'pcs',
        originCountry: 'India',
        hsCode: '8481.80',
        exporterId: exporters[0].id,
        stockQty: 500,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organic Cotton Fabric',
        description: '100% certified organic cotton fabric, 200 GSM.',
        price: 15,
        category: 'Textiles',
        minOrderQty: 100,
        unit: 'meters',
        originCountry: 'India',
        hsCode: '5208.11',
        exporterId: exporters[0].id,
        stockQty: 2000,
      },
    }),
  ]);

  console.log('Products created.');

  // 3. Create Orders
  await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      importer: { connect: { id: importers[0].id } },
      totalPrice: 4500,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      product: { connect: { id: products[0].id } },
      quantity: 10,
    },
  });

  console.log('Order created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
