import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createSupabaseRouteClient(request);

    // Only authenticated users can enroll in MFA
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enroll in TOTP (Auth Authenticator)
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Renote Exim",
      friendlyName: user.email,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("MFA enroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
