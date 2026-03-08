import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSupabaseEnv } from "@/lib/supabase/shared";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import type { Role } from "@prisma/client";

export type ApiAuthContext = {
  userId: string;
  role: Role;
};

const VALID_ROLES: Role[] = ["USER", "EXPORTER", "IMPORTER", "ADMIN"];

function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && VALID_ROLES.includes(value as Role);
}

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

/**
 * Resolves the Supabase user from the request.
 * Tries Bearer token first, then falls back to SSR cookies.
 * Returns the Supabase user object or null.
 */
async function resolveSupabaseUser(request: NextRequest) {
  const token = extractBearerToken(request);

  if (token) {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return data.user;
  }

  // Fallback: cookie-based session
  const { supabase } = createSupabaseRouteClient(request);
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    const { data, error } = await supabase.auth.getUser(sessionData.session.access_token);
    if (!error && data.user) return data.user;
  }

  return null;
}

export async function getApiAuthContext(request: NextRequest): Promise<ApiAuthContext | null> {
  const user = await resolveSupabaseUser(request);
  if (!user) return null;

  // Try Prisma first
  try {
    let profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    // If no profile exists, auto-create from Supabase auth metadata.
    if (!profile) {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const rawRole = typeof meta.role === "string" ? meta.role.toUpperCase() : "IMPORTER";
      const role: Role = isValidRole(rawRole) ? rawRole : "IMPORTER";

      console.log(`[getApiAuthContext] Auto-creating missing profile for user ${user.id} with role ${role}`);

      profile = await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email ?? "",
          name: typeof meta.name === "string" ? meta.name : null,
          role,
          companyName: typeof meta.companyName === "string" ? meta.companyName : null,
          country: typeof meta.country === "string" ? meta.country : null,
          phone: typeof meta.phone === "string" ? meta.phone : null,
          website: typeof meta.website === "string" ? meta.website : null,
          verified: false,
        },
        select: { id: true, role: true },
      });
    }

    return { userId: profile.id, role: profile.role };
  } catch (prismaError) {
    console.warn("[getApiAuthContext] Prisma failed, falling back to auth metadata:", prismaError);
  }

  // Fallback: use Supabase auth metadata (same approach as /api/auth/me)
  // This works even when the database is completely unreachable
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawRole = typeof meta.role === "string" ? meta.role.toUpperCase() : "IMPORTER";
  const role: Role = isValidRole(rawRole) ? rawRole : "IMPORTER";

  console.log(`[getApiAuthContext] Using auth metadata fallback for user ${user.id} with role ${role}`);
  return { userId: user.id, role };
}

