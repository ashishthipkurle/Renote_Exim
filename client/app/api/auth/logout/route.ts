import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  try {
    const { supabase, applyCookies } = createSupabaseRouteClient(request);
    await supabase.auth.signOut();
    const res = NextResponse.json({ message: "Logged out" });
    return applyCookies(res);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing Supabase env")) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
