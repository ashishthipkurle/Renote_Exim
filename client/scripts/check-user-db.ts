import { prisma } from "../lib/prisma";

async function checkUser(email: string) {
  try {
    console.log(`Checking user existence for: ${email}`);
    
    // Nhost stores auth users in the 'auth' schema, 'users' table
    const result: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, email, email_verified, disabled FROM auth.users WHERE email = $1`,
      email
    );

    if (result.length === 0) {
      console.log("Result: User NOT found in auth.users");
    } else {
      console.log("Result: User FOUND", result[0]);
    }

    // Also check the public schema
    const publicUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (publicUser) {
      console.log("Result: User FOUND in public.users (Prisma)", { id: publicUser.id, role: publicUser.role });
    } else {
      console.log("Result: User NOT found in public.users");
    }

  } catch (err: any) {
    console.error("Error checking database:", err.message);
  }
}

checkUser("Importer13@gmail.com");
