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
      result = await nhost.auth.signInEmailPassword({
        email: validatedData.email,
        password: validatedData.password,
      });
    } catch (authError: any) {
      const msg = authError?.body?.message || authError?.message || "Invalid email or password";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const error = result.error || result.body?.error;
    const session = result.session || result.body?.session;
    const mfa = result.mfa || result.body?.mfa;

    if (error || !session?.user || !session.accessToken) {
      return NextResponse.json(
        { error: error?.message ?? "Invalid email or password" },
        { status: 401 }
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

    response.cookies.set(AUTH_COOKIE_NAME, session.accessToken, AUTH_COOKIE_OPTIONS);
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
