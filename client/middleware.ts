import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { tryGetSupabaseEnv } from "@/lib/supabase/shared";

// Define public routes that don't require authentication
const publicRoutes = ['/', '/about', '/contact', '/products', '/login', '/register'];

// Define role-based routes
const roleRoutes = {
  '/dashboard/exporter': ['EXPORTER', 'ADMIN'],
  '/dashboard/importer': ['IMPORTER', 'ADMIN'],
  '/dashboard/admin': ['ADMIN'],
};

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Allow API routes (handle auth in API itself)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protected dashboard routes require a Supabase session.
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const env = tryGetSupabaseEnv();
  if (!env) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "supabase_env_missing");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const { url, anonKey } = env;
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: CookieToSet[]) {
        for (const cookie of cookies) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control for dashboard areas
  const matchedPrefix = (Object.keys(roleRoutes) as Array<keyof typeof roleRoutes>).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!matchedPrefix) {
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    // RLS/trigger may not be installed yet; fall back to auth metadata.
    console.warn("Middleware profile role lookup failed:", profileError.message);
  }

  const role =
    (profile?.role as string | undefined) ??
    ((user.user_metadata as any)?.role as string | undefined) ??
    ((user.app_metadata as any)?.role as string | undefined);
  const allowed = role ? roleRoutes[matchedPrefix].includes(role) : false;

  if (!allowed) {
    const url = request.nextUrl.clone();
    url.pathname = role ? `/dashboard/${role.toLowerCase()}` : "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
