import { prisma } from "../lib/prisma";
import { nhost } from "../lib/nhost";

async function checkMaster() {
  console.log("Checking exporter@gmail.com...");
  
  // 1. Check Prisma
  const dbUser = await prisma.user.findFirst({
    where: { email: 'exporter@gmail.com' }
  });
  
  if (dbUser) {
    console.log("Prisma Record Found:");
    console.log(JSON.stringify(dbUser, null, 2));
  } else {
    console.log("Prisma Record NOT Found.");
  }
  
  // 2. Check Nhost (via SQL)
  try {
    const authResult: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, email, email_verified, disabled FROM auth.users WHERE email = 'exporter@gmail.com'`
    );
    
    if (authResult.length > 0) {
      console.log("Nhost Record Found:");
      console.log(JSON.stringify(authResult[0], null, 2));
    } else {
      console.log("Nhost Record NOT Found.");
    }
  } catch (e: any) {
    console.error("Failed to query auth.users:", e.message);
  }
}

checkMaster().catch(console.error);
