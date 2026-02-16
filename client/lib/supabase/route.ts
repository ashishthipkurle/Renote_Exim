import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSupabaseEnv } from "./shared";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createSupabaseRouteClient(request: NextRequest): {
  supabase: SupabaseClient;
  applyCookies: (response: NextResponse) => NextResponse;
} {
  const { url, anonKey } = getSupabaseEnv();
  const pending: CookieToSet[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: CookieToSet[]) {
        for (const cookie of cookies) pending.push(cookie);
      },
    },
  });

  return {
    supabase,
    applyCookies(response) {
      for (const cookie of pending) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
      return response;
    },
  };
}
