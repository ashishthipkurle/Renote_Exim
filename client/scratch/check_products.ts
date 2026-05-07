import { prisma } from "../lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, minOrderQty: true, moq: true, b2bPrice: true, b2cPrice: true }
  });
  console.log(JSON.stringify(products, null, 2));
}

main();
