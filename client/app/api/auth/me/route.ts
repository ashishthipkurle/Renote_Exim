import { NextRequest, NextResponse } from "next/server";
import { getApiAuthContext } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 try {
 // 1. Get the current auth context (Nhost native)
   const { auth, error, newAccessToken, newRefreshToken } = await getApiAuthContext(request);

 if (error || !auth) {
 // Return the specific error from context if available
 if (error) return error;
 
 return NextResponse.json(
 { error: "Unauthorized access" },
 { status: 401 }
 );
 }

 // 2. The auth.user already contains the profile fetched from Prisma
 // We just need to ensure the format matches what the UI expects
 const user = auth.user;

 const profile = {
 id: user.id,
 name: user.name || null,
 email: user.email,
 role: user.role,
 businessName: user.businessName || null,
 country: user.country || null,
 phone: user.phone || null,
 website: user.website || null,
 verified: user.verified || false,
 avatar: user.avatar || null,
 createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
 updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
 };

   return NextResponse.json({ 
    user: profile,
    newAccessToken: newAccessToken || null,
    newRefreshToken: newRefreshToken || null
  });

 } catch (error) {
 console.error("Get user error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}
