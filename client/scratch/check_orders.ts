import { prisma } from "../lib/prisma";

async function main() {
  const orders = await prisma.order.findMany({
    take: 10,
    include: {
      product: { select: { name: true, exporterId: true } },
      buyer: { select: { name: true } },
      seller: { select: { name: true } }
    }
  });
  console.log(JSON.stringify(orders, null, 2));
}

main();
