const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkOrders() {
  console.log("--- ALL ORDERS ---");
  const orders = await prisma.order.findMany({
    include: {
      buyer: { select: { id: true, name: true, role: true } },
      seller: { select: { id: true, name: true, role: true } },
      product: { select: { id: true, name: true } },
    }
  });

  orders.forEach((o: any) => {
    console.log(`ID: ${o.id} | Number: ${o.orderNumber} | Buyer: ${o.buyer?.name} (${o.buyer?.id}) | Seller: ${o.seller?.name} (${o.seller?.id}) | Product: ${o.product?.name} | Status: ${o.orderStatus}`);
  });
  
  await prisma.$disconnect();
}

checkOrders().catch(async (e: any) => {
  console.error(e);
  await prisma.$disconnect();
});
