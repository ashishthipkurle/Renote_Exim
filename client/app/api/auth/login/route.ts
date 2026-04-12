import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginSchema } from "@/lib/validations";
import { nhost } from "@/lib/nhost";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-server";

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
    const validatedData = loginSchema.parse(body);

    // Nhost v4 SDK throws on auth failure, so we must catch it
    let result: any;
    try {
      console.log("[Login] Attempting sign-in for:", validatedData.email);
      result = await nhost.auth.signInEmailPassword({
        email: validatedData.email,
        password: validatedData.password,
      });
      console.log("[Login] Nhost SDK raw result keys:", Object.keys(result));
    } catch (authError: any) {
      const msg = authError?.body?.message || authError?.message || "Invalid email or password";
      console.error("[Login] Nhost SDK threw error:", msg);
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const error = result.error || result.body?.error;
    const session = result.session || result.body?.session;

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!session?.user || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication failed to establish session. Please try again." },
        { status: 500 }
      );
    }

    const meta = isRecord(session.user.metadata) ? session.user.metadata : {};
    const metaRole = getString(meta, "role");

    const profile = {
      id: session.user.id,
      email: session.user.email ?? "",
      role: metaRole ?? "IMPORTER",
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: profile,
      token: session.accessToken,
    });

    console.log("[Login] Setting auth cookies");
    response.cookies.set(AUTH_COOKIE_NAME, session.accessToken, AUTH_COOKIE_OPTIONS);
    
    // Also set refresh token cookie
    if (session.refreshToken) {
      response.cookies.set("sb_refresh_token", session.refreshToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
