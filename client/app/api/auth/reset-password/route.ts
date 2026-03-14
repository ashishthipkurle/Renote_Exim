import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resetPasswordSchema } from "@/lib/validations";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = resetPasswordSchema.parse(body);

    const { supabase, applyCookies } = createSupabaseRouteClient(request);
    
    // update current user password (the user is signed in via the link/session)
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const res = NextResponse.json({
      message: "Password has been reset successfully. You can now log in with your new password.",
    });

    return applyCookies(res);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
