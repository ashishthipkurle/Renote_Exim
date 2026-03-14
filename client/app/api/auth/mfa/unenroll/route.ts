import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  try {
    const { factorId } = await request.json();

    if (!factorId) {
      return NextResponse.json({ error: "factorId is required" }, { status: 400 });
    }

    const { supabase } = createSupabaseRouteClient(request);

    const { data, error } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("MFA unenroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
