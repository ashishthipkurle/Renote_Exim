import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 const cookieStore = cookies();
 const allCookies = cookieStore.getAll();
 const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

 const debugInfo = {
 timestamp: new Date().toISOString(),
 environment: {
 NODE_ENV: process.env.NODE_ENV,
 APP_URL: process.env.NEXT_PUBLIC_APP_URL,
 NHOST_SUBDOMAIN: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ? "Defined" : "MISSING",
 NHOST_REGION: process.env.NEXT_PUBLIC_NHOST_REGION ? "Defined" : "MISSING",
 },
 cookies: {
 count: allCookies.length,
 names: allCookies.map(c => c.name),
 authCookiePresent: !!authCookie,
 authCookieName: AUTH_COOKIE_NAME,
 },
 request: {
 url: request.url,
 method: request.method,
 hasAuthHeader: !!request.headers.get("Authorization"),
 }
 };

 return NextResponse.json(debugInfo);
}
