import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSupabaseEnv } from "@/lib/supabase/shared";
import type { Role } from "@prisma/client";

export type ApiAuthContext = {
  userId: string;
  role: Role;
};

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

export async function getApiAuthContext(request: NextRequest): Promise<ApiAuthContext | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, role: true },
  });

  if (!profile) return null;

  return { userId: profile.id, role: profile.role };
}
