import { prisma } from "./lib/prisma.ts";

async function run() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      seller: true,
      product: true,
    }
  });
  console.log(JSON.stringify(orders, null, 2));
}

run();
