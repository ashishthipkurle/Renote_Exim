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

    // Check for Multi-Factor Authentication requirement
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (!mfaError && mfaData.nextLevel === 'aal2' && mfaData.currentLevel !== 'aal2') {
      // MFA is required to complete the login
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = factors?.all.filter(f => f.status === 'verified') || [];
      
      if (verifiedFactors.length > 0) {
        return NextResponse.json({
          mfaRequired: true,
          factors: verifiedFactors,
          user: { id: data.user.id, email: data.user.email }
        });
      }
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

    // Audit Log: Record successful login
    try {
      const prismaModule = await import("@/lib/prisma");
      await prismaModule.prisma.loginHistory.create({
        data: {
          userId: data.user.id,
          ip: request.ip || request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent"),
          success: true,
        },
      });
    } catch (e) {
      console.warn("Audit logging failed:", e);
    }

    return applyCookies(res);

  } catch (error) {
    // Audit Log: Record failed login attempt if we have an email
    // This is simplified; in a real app you'd want to be careful about logging
    // but here we want to track suspicious activity.
    try {
      if (error instanceof z.ZodError) {
        // Validation failed, maybe don't log yet or log as malformed
      } else {
        // Potential failed attempt logic could go here if we tracked the email
      }
    } catch (e) {}

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
