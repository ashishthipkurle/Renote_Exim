import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const { supabase, applyCookies } = createSupabaseRouteClient(request);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url));
      return applyCookies(response);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
