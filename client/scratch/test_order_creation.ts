import { prisma } from "../lib/prisma";

async function main() {
  const product = await prisma.product.findFirst();
  if (!product) {
    console.log("No product found to create order for.");
    return;
  }
  const user = await prisma.user.findFirst({ where: { role: 'IMPORTER' } });
  if (!user) {
    console.log("No importer found.");
    return;
  }

  try {
    const order = await prisma.order.create({
      data: {
        orderType: 'B2B',
        orderNumber: `TEST-${Date.now()}`,
        buyerId: user.id,
        sellerId: product.exporterId,
        productId: product.id,
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        currency: 'USD',
        orderStatus: 'QUOTE_REQUESTED',
        paymentStatus: 'PENDING',
      }
    });
    console.log("Order created successfully:", order.id);
  } catch (e: any) {
    console.error("Failed to create order:", e);
  }
}

main();
