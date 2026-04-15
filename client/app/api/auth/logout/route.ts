import { NextRequest, NextResponse } from "next/server";
import { clearServerAuthCookie } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
 try {
 // v4 SDK signOut requires a refreshToken which we don't store server-side.
 // Simply clear our auth cookie to end the session on our side.
 clearServerAuthCookie();

 return NextResponse.json({ message: "Logged out" });
 } catch (error) {
 console.error("Logout error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}
