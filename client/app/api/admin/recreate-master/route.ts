import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nhost } from "@/lib/nhost";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = "exporter@gmail.com";
  const password = "Master@Ranote2026";
  const name = "Ashish";

  console.log(`[Admin] Starting restoration process for ${email}...`);

  try {
    // 1. Clean up existing records in Nhost (if any)
    console.log("[Admin] Cleaning up old Nhost records...");
    await prisma.$executeRawUnsafe(
      `DELETE FROM auth.users WHERE email = $1`,
      email
    ).catch(e => console.log("[Admin] Nhost cleanup (not found or failed):", e.message));

    // 2. Clean up existing records in Prisma (HARD DELETE)
    // This bypasses Prisma's soft-delete logic to fix the "Unique constraint failed" error
    console.log("[Admin] Cleaning up ghost Prisma records...");
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.users WHERE email = $1`,
      email
    );

    // 3. Register via Nhost
    console.log("[Admin] Registering in Nhost...");
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

    console.log("[Admin] Signup Result Structure:", JSON.stringify({
      hasSession: !!signupResult.session,
      hasUser: !!signupResult.user,
      error: signupResult.error
    }));

    const newUserId = signupResult.user?.id || signupResult.session?.user?.id;
    if (!newUserId) {
      // Emergency Fallback: If signup worked but didn't return an ID, try to find it via SQL
      const findResult: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM auth.users WHERE email = $1`,
        email
      );
      if (findResult.length > 0) {
        return handleCompletion(findResult[0].id);
      }
      throw new Error(`Could not retrieve new user ID. Result keys: ${Object.keys(signupResult).join(', ')}`);
    }

    return handleCompletion(newUserId);
  } catch (error: any) {
    console.error("[Admin] FATAL ERROR during restoration:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      details: error
    }, { status: 500 });
  }

  async function handleCompletion(id: string) {
    console.log(`[Admin] Completing setup for ID: ${id}`);

    // 4. Force Verify in Nhost
    console.log("[Admin] Force verifying email in Nhost...");
    await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET email_verified = true WHERE id = $1::uuid`,
      id
    );

    // 5. Create or Update Prisma Profile
    console.log("[Admin] Syncing Prisma profile...");
    await prisma.user.upsert({
      where: { id: id },
      update: {
        email,
        name,
        role: "EXPORTER",
        verificationStatus: "VERIFIED",
      },
      create: {
        id: id,
        email,
        name,
        role: "EXPORTER",
        verificationStatus: "VERIFIED",
        country: "India",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Master Exporter account restored with NEW PASSWORD.",
      email,
      password: password,
      id: id,
      loginUrl: "/login"
    });
  }
}
