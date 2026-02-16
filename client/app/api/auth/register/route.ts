import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { registerSchema } from "@/lib/validations";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    const { supabase, applyCookies } = createSupabaseRouteClient(request);

    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          role: validatedData.role,
          companyName: validatedData.companyName,
          country: validatedData.country,
          phone: validatedData.phone,
          website: validatedData.website,
        },
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Registration failed" },
        { status: 400 }
      );
    }

    // If email confirmations are enabled, session may be null. In that case, we can still
    // return a helpful message and let the user sign in after confirming.
    if (!data.session) {
      const res = NextResponse.json(
        {
          message:
            "Registration successful. Please check your email to confirm your account, then log in.",
        },
        { status: 201 }
      );
      return applyCookies(res);
    }

    // Best-effort update to profile row (created via DB trigger). If RLS/trigger isn't
    // installed yet, we still want the registration flow to succeed.
    const { error: profileUpdateError } = await supabase
      .from("users")
      .update({
        name: validatedData.name,
        role: validatedData.role,
        companyName: validatedData.companyName,
        country: validatedData.country,
        phone: validatedData.phone,
        website: validatedData.website,
      })
      .eq("id", data.user.id);

    if (profileUpdateError) {
      console.warn("Profile update skipped/failed:", profileUpdateError.message);
    }

    // Prefer Prisma profile (if DATABASE_URL is configured). Otherwise fall back to Supabase.
    let profile:
      | {
          id: string;
          name: string | null;
          email: string;
          role: string;
          companyName: string | null;
          country: string | null;
          phone: string | null;
          website: string | null;
          verified: boolean | null;
          avatar: string | null;
          createdAt?: string;
          updatedAt?: string;
        }
      | null = null;

    try {
      const prismaModule = await import("@/lib/prisma");
      const prisma = prismaModule.prisma;

      const prismaProfile = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          country: true,
          phone: true,
          website: true,
          verified: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (prismaProfile) {
        profile = {
          ...prismaProfile,
          role: String(prismaProfile.role),
          createdAt: prismaProfile.createdAt.toISOString(),
          updatedAt: prismaProfile.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Prisma unavailable; using Supabase profile fallback:", e);
    }

    if (!profile) {
      const { data: supaProfile, error: supaError } = await supabase
        .from("users")
        .select("id,name,email,role,companyName,country,phone,website,verified,avatar,createdAt,updatedAt")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!supaError && supaProfile) {
        const row = isRecord(supaProfile) ? supaProfile : {};
        profile = {
          id: getString(row, "id") ?? data.user.id,
          name: getString(row, "name"),
          email: getString(row, "email") ?? data.user.email ?? validatedData.email,
          role: getString(row, "role") ?? validatedData.role,
          companyName: getString(row, "companyName"),
          country: getString(row, "country"),
          phone: getString(row, "phone"),
          website: getString(row, "website"),
          verified: getBoolean(row, "verified"),
          avatar: getString(row, "avatar"),
          createdAt: getString(row, "createdAt") ?? undefined,
          updatedAt: getString(row, "updatedAt") ?? undefined,
        };
      } else {
        if (supaError) console.warn("Supabase profile lookup failed:", supaError.message);
      }
    }

    if (!profile) {
      // Last-resort: construct a minimal profile from the signup payload so the UI can proceed.
      profile = {
        id: data.user.id,
        name: validatedData.name ?? null,
        email: data.user.email ?? validatedData.email,
        role: validatedData.role,
        companyName: validatedData.companyName ?? null,
        country: validatedData.country ?? null,
        phone: validatedData.phone ?? null,
        website: validatedData.website ?? null,
        verified: null,
        avatar: null,
      };
    }

    // Optional welcome notification (best-effort; skip if Prisma isn't configured)
    try {
      const prismaModule = await import("@/lib/prisma");
      await prismaModule.prisma.notification.create({
        data: {
          userId: profile.id,
          type: "GENERAL",
          title: "Welcome to Renote Exim!",
          message: `Welcome ${profile.name ?? ""}! Your account has been created successfully. Complete your profile to start trading.`,
        },
      });
    } catch (e) {
      console.warn("Welcome notification skipped:", e);
    }

    const res = NextResponse.json(
      {
        message: "Registration successful",
        user: profile,
        token: data.session.access_token,
      },
      { status: 201 }
    );

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

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
