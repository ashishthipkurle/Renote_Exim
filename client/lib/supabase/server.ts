import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getSupabaseEnv } from "./shared";
import type { Role } from "@prisma/client";

export type ServerAuthContext = {
  userId: string;
  role: Role;
  name: string | null;
  email: string | null;
};

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  if (upper === "USER" || upper === "EXPORTER" || upper === "IMPORTER" || upper === "ADMIN") {
    return upper as Role;
  }
  return null;
}

function chooseEffectiveRole(profileRole: Role | null, metaRole: Role | null, appMetaRole: Role | null): Role | null {
  if (profileRole === "ADMIN") return "ADMIN";

  const safeMetaRole = metaRole === "ADMIN" ? null : metaRole;
  const safeAppMetaRole = appMetaRole === "ADMIN" ? null : appMetaRole;

  if (profileRole && safeMetaRole && profileRole !== safeMetaRole) {
    return safeMetaRole;
  }

  return profileRole ?? safeMetaRole ?? safeAppMetaRole;
}

/**
 * Get the authenticated user in a Server Component or Server Action.
 * Returns null if not authenticated or env is missing.
 */
export async function getServerAuth(): Promise<ServerAuthContext | null> {
  try {
    const { url, anonKey } = getSupabaseEnv();
    const cookieStore = await cookies();

    // DEBUG: Log all cookie names to see what's available
    const allCookies = cookieStore.getAll();
    console.warn("[getServerAuth] Cookie names:", allCookies.map(c => c.name).join(", "));

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll() {
          // Server Components cannot set cookies – noop
        },
      },
    });

    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await supabase.auth.getUser();

    console.warn("[getServerAuth] SSR getUser:", sessionUser ? `found (${sessionUser.id})` : "null", sessionError ? `error: ${sessionError.message}` : "");

    let user = sessionUser;

    if (!user) {
      const fallbackAccessToken = cookieStore.get("sb_access_token")?.value;
      console.warn("[getServerAuth] sb_access_token cookie:", fallbackAccessToken ? `exists (${fallbackAccessToken.length} chars)` : "missing");
      if (fallbackAccessToken) {
        try {
          const decodedToken = decodeURIComponent(fallbackAccessToken);
          const { data: fallbackData, error: fallbackError } = await supabase.auth.getUser(decodedToken);
          console.warn("[getServerAuth] Fallback getUser:", fallbackData.user ? `found (${fallbackData.user.id})` : "null", fallbackError ? `error: ${fallbackError.message}` : "");
          user = fallbackData.user;
        } catch (e) {
          console.warn("[getServerAuth] Fallback token decode/validate error:", e);
        }
      }
    }

    if (!user) {
      console.warn("[getServerAuth] No user found after all attempts, returning null");
      return null;
    }

    console.warn("[getServerAuth] Authenticated user:", user.id);

    const userMetaName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
    const userMetaEmail = typeof user.email === "string" ? user.email : null;

    let profile: { id: string; role: Role; name: string | null; email: string | null } | null = null;

    try {
      profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, email: true },
      });
    } catch {
      // Prisma may be unavailable in some environments; continue with Supabase/metadata fallbacks.
    }

    let supabaseProfile:
      | { id: string; role: Role | null; name: string | null; email: string | null }
      | null = null;

    if (!profile || !profile.role) {
      try {
        const { data: supaUser, error: supaError } = await supabase
          .from("users")
          .select("id,role,name,email")
          .eq("id", user.id)
          .maybeSingle();

        if (!supaError && supaUser) {
          const row = supaUser as Record<string, unknown>;
          const parsedRole = normalizeRole(row.role);
          supabaseProfile = {
            id: typeof row.id === "string" ? row.id : user.id,
            role: parsedRole,
            name: typeof row.name === "string" ? row.name : null,
            email: typeof row.email === "string" ? row.email : null,
          };
        }
      } catch {
        // Supabase table fallback not available; metadata fallback below can still authenticate.
      }
    }

    const role =
      chooseEffectiveRole(
      profile?.role ?? supabaseProfile?.role ?? null,
      normalizeRole(user.user_metadata?.role),
      normalizeRole(user.app_metadata?.role)
      ) ?? "IMPORTER";

    return {
      userId: profile?.id ?? supabaseProfile?.id ?? user.id,
      role,
      name: profile?.name ?? supabaseProfile?.name ?? userMetaName,
      email: profile?.email ?? supabaseProfile?.email ?? userMetaEmail,
    };
  } catch (outerError) {
    console.error("[getServerAuth] OUTER CATCH – unexpected error:", outerError);
    return null;
  }
}
