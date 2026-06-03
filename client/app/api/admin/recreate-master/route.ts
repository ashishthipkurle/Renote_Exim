import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = "exporter@gmail.com";
  const password = "Master@Ranote2026";
  const name = "Ashish";

  console.log(`[Admin] Starting restoration process for ${email}...`);

  try {
    const supabase = createAdminClient();

    // 1. Clean up existing records in Prisma (HARD DELETE)
    console.log("[Admin] Cleaning up ghost Prisma records...");
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.users WHERE email = $1`,
      email
    ).catch(e => console.log(e.message));

    // 2. Register via Supabase Admin (auto confirms email)
    console.log("[Admin] Registering in Supabase...");
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "EXPORTER",
      }
    });

    if (error || !user.user) {
      throw new Error(`Supabase signup failed: ${error?.message}`);
    }

    const newUserId = user.user.id;

    console.log(`[Admin] Completing setup for ID: ${newUserId}`);

    // 3. Create or Update Prisma Profile
    console.log("[Admin] Syncing Prisma profile...");
    await prisma.user.upsert({
      where: { id: newUserId },
      update: {
        email,
        name,
        role: "EXPORTER",
        verificationStatus: "VERIFIED",
      },
      create: {
        id: newUserId,
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
      id: newUserId,
      loginUrl: "/login"
    });
  } catch (error: any) {
    console.error("[Admin] FATAL ERROR during restoration:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      details: error
    }, { status: 500 });
  }
}
