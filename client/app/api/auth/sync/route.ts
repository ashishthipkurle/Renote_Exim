export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth-server";
import { cookies } from "next/headers";

const AUTH_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
};

const REFRESH_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * POST /api/auth/sync
 * Allows the client-side AuthProvider to sync the Nhost session to server-side cookies.
 * This is critical for keeping the sb_access_token and sb_refresh_token fresh.
 */
export async function POST(request: NextRequest) {
 try {
 const { accessToken, refreshToken, user } = await request.json();

 if (!accessToken) {
 // If no access token, we clear the cookies (logout case)
 const response = NextResponse.json({ message: "Session cleared" });
 response.cookies.delete(AUTH_COOKIE_NAME);
 response.cookies.delete(REFRESH_COOKIE_NAME);
 return response;
 }

 const response = NextResponse.json({ 
 message: "Session synced",
 user: user || null
 });

 // Set the access token cookie
 response.cookies.set(AUTH_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS);

 // Set the refresh token cookie if provided
 if (refreshToken) {
 response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
 }

 return response;
 } catch (error) {
 console.error("[Auth Sync] Error syncing session:", error);
 return NextResponse.json({ error: "Failed to sync session" }, { status: 500 });
 }
}

