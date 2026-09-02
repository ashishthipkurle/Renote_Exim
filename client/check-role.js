const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'ashishthipkurle2k19@gmail.com' },
    select: { email: true, role: true }
  });
  console.log(user);
}

check().catch(console.error).finally(() => prisma.$disconnect());
