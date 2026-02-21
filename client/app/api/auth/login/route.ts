import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { loginSchema } from "@/lib/validations";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    const { supabase, applyCookies } = createSupabaseRouteClient(request);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: error?.message ?? "Invalid email or password" },
        { status: 401 }
      );
    }

    const meta = isRecord(data.user.user_metadata) ? data.user.user_metadata : {};
    const metaRole = getString(meta, "role");

    // Minimal user data from auth. Let the client AuthProvider fetch the full profile via /api/auth/me
    const profile = {
      id: data.user.id,
      email: data.user.email ?? "",
      role: metaRole ?? "IMPORTER",
    };

    const res = NextResponse.json({
      message: "Login successful",
      user: profile,
      token: data.session.access_token,
    });

    return applyCookies(res);

  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing Supabase env")) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
