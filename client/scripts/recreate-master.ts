import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../lib/prisma";
import { nhost } from "../lib/nhost";

async function recreateMaster() {
  const email = "exporter@gmail.com";
  const password = "Ashish@12345";
  const name = "Ashish";

  console.log("Nhost Config:", {
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
    region: process.env.NEXT_PUBLIC_NHOST_REGION,
  });

  if (!process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN) {
    throw new Error("Missing NEXT_PUBLIC_NHOST_SUBDOMAIN environment variable");
  }

  console.log(`Starting restoration process for ${email}...`);

  try {
    // 1. Clean up existing records in Nhost (if any)
    console.log("Cleaning up old Nhost records...");
    await prisma.$executeRawUnsafe(
      `DELETE FROM auth.users WHERE email = $1`,
      email
    ).catch(e => console.log("Nhost cleanup (not found or failed):", e.message));

    // 2. Clean up existing records in Prisma
    console.log("Cleaning up Prisma profile...");
    await prisma.user.deleteMany({
      where: { email }
    });

    // 3. Register via Nhost
    console.log("Registering in Nhost...");
    const signupResult = await nhost.auth.signUpEmailPassword({
      email,
      password,
      options: {
        metadata: {
          name,
          role: "EXPORTER",
        }
      }
    });

    if (signupResult.error) {
      throw new Error(`Nhost Signup Failed: ${signupResult.error.message}`);
    }

    const newUserId = signupResult.session?.user?.id || signupResult.user?.id;
    if (!newUserId) throw new Error("Could not retrieve new user ID");

    console.log(`New Nhost User created with ID: ${newUserId}`);

    // 4. Force Verify in Nhost
    console.log("Force verifying email in Nhost...");
    await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET email_verified = true WHERE id = $1`,
      newUserId
    );

    // 5. Create Prisma Profile
    console.log("Creating Prisma profile...");
    await prisma.user.create({
      data: {
        id: newUserId,
        email,
        name,
        role: "EXPORTER",
        verificationStatus: "VERIFIED",
        country: "India",
      }
    });

    console.log("\nSUCCESS: Master Exporter account restored.");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("\nYou should now be able to log in at /login.");

  } catch (error: any) {
    console.error("\nFATAL ERROR during restoration:");
    console.error(error.message || error);
    process.exit(1);
  }
}

recreateMaster().catch(console.error);
