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
  '/dashboard/user': ['USER', 'ADMIN'],
};

type CookieToSet = { name: string; value: string; options: CookieOptions };

type AppRole = "USER" | "EXPORTER" | "IMPORTER" | "ADMIN";

function normalizeRole(value: unknown): AppRole | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  if (upper === "USER" || upper === "EXPORTER" || upper === "IMPORTER" || upper === "ADMIN") return upper;
  return undefined;
}

function chooseEffectiveRole(profileRole?: AppRole, metaRole?: AppRole, appMetaRole?: AppRole): AppRole | undefined {
  // DB role is authoritative for ADMIN.
  if (profileRole === "ADMIN") return "ADMIN";

  // Never allow ADMIN escalation via user/app metadata.
  const safeMetaRole = metaRole === "ADMIN" ? undefined : metaRole;
  const safeAppMetaRole = appMetaRole === "ADMIN" ? undefined : appMetaRole;

  // If DB role is present but mismatches metadata (common right after signup when DB write is blocked),
  // prefer metadata for EXPORTER/IMPORTER.
  if (profileRole && safeMetaRole && profileRole !== safeMetaRole) {
    return safeMetaRole;
  }

  return profileRole ?? safeMetaRole ?? safeAppMetaRole;
}

function extractRoleFromUnknownMeta(value: unknown): AppRole | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const role = (value as Record<string, unknown>).role;
  return normalizeRole(role);
}

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

  const env = tryGetSupabaseEnv();
  if (!env) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "supabase_env_missing");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ---------- Supabase SSR middleware pattern ----------
  // CRITICAL: When Supabase refreshes tokens, we must:
  //   1. Update the REQUEST cookies (so server components see them)
  //   2. Create NextResponse.next({ request }) with the modified request
  //   3. Set cookies on the RESPONSE (so the browser gets them)
  // Without step 1+2, server components read stale/expired cookies.
  const { url, anonKey } = env;
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        // Step 1: Update request cookies so server components see the new values
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Step 2: Create a fresh response with the modified request
        supabaseResponse = NextResponse.next({ request });
        // Step 3: Set cookies on the response for the browser
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const fallbackAccessToken = request.cookies.get("sb_access_token")?.value;
    if (fallbackAccessToken) {
      const { data: fallbackData } = await supabase.auth.getUser(fallbackAccessToken);
      user = fallbackData.user;
    }
  }

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
    return supabaseResponse;
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
    chooseEffectiveRole(
      normalizeRole(profile?.role as unknown),
      extractRoleFromUnknownMeta(user.user_metadata),
      extractRoleFromUnknownMeta(user.app_metadata)
    );
  const allowed = role ? roleRoutes[matchedPrefix].includes(role) : false;

  if (!allowed) {
    const url = request.nextUrl.clone();
    // USER role has no dashboard — redirect to marketplace
    if (role === "USER") {
      url.pathname = "/products";
    } else {
      url.pathname = role ? `/dashboard/${role.toLowerCase()}` : "/login";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
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
