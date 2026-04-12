import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 const email = "exporter@gmail.com";
 const name = "Ashish";

 console.log(`[Admin] Starting Heal & Sync for ${email}...`);

 try {
 // 1. Find the current Nhost ID via SQL
 console.log("[Admin] Finding Nhost ID...");
 const authResult: any[] = await prisma.$queryRawUnsafe(
 `SELECT id, email_verified FROM auth.users WHERE email = $1`,
 email
 );

 if (authResult.length === 0) {
 throw new Error(`Nhost user ${email} not found. Please try the recreate-master link again first.`);
 }

 const currentId = authResult[0].id;
 console.log(`[Admin] Found Nhost ID: ${currentId}`);

 // 2. Force Verify in Nhost
 console.log("[Admin] Force verifying email in Nhost...");
 await prisma.$executeRawUnsafe(
 `UPDATE auth.users SET email_verified = true WHERE id = $1::uuid`,
 currentId
 );

 // 2. Clear out any existing "ghost" records for this email (HARD DELETE)
 // This bypasses Prisma's soft-delete logic to fix the "Unique constraint failed" error
 console.log("[Admin] Performing hard cleanup of ghost records...");
 
 // Cleanup from public.users (Prisma table)
 await prisma.$executeRawUnsafe(
 `DELETE FROM public.users WHERE email = $1 AND id != $2`,
 email, currentId
 );
 
 // 3. Force Verify in Nhost
 console.log("[Admin] Force verifying email in Nhost...");
 await prisma.$executeRawUnsafe(
 `UPDATE auth.users SET email_verified = true WHERE id = $1::uuid`,
 currentId
 );

 // 4. Create or Update Prisma Profile
 console.log("[Admin] Syncing Prisma profile...");
 await prisma.user.upsert({
 where: { id: currentId },
 update: {
 email,
 name,
 role: "EXPORTER",
 verificationStatus: "VERIFIED",
 deletedAt: null, // Ensure it's not soft-deleted
 },
 create: {
 id: currentId,
 email,
 name,
 role: "EXPORTER",
 verificationStatus: "VERIFIED",
 country: "India",
 }
 });

 return NextResponse.json({
 success: true,
 message: "Master Exporter account HARD-SYNCED successfully.",
 email,
 id: currentId,
 password: "Master@Ranote2026",
 loginUrl: "/login"
 });

 } catch (error: any) {
 console.error("[Admin] FATAL ERROR during hard sync:", error);
 return NextResponse.json({
 success: false,
 error: error.message || "Unknown error",
 details: error
 }, { status: 500 });
 }
}
