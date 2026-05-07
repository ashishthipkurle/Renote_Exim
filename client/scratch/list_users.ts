import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, businessName: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main();
