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

function getBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
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
      const prismaProfile = await prismaModule.prisma.user.findUnique({
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
      console.warn("Prisma profile lookup failed:", e);
    }

    if (!profile) {
      const { data: supaProfile, error: supaError } = await supabase
        .from("users")
        .select("id,name,email,role,companyName,country,phone,website,verified,avatar,createdAt,updatedAt")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!supaError && supaProfile) {
        const row = isRecord(supaProfile) ? supaProfile : {};
        const meta = isRecord(data.user.user_metadata) ? data.user.user_metadata : {};
        profile = {
          id: getString(row, "id") ?? data.user.id,
          name: getString(row, "name"),
          email: getString(row, "email") ?? data.user.email ?? "",
          role: getString(row, "role") ?? getString(meta, "role") ?? "IMPORTER",
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
      const meta = isRecord(data.user.user_metadata) ? data.user.user_metadata : {};
      profile = {
        id: data.user.id,
        name: getString(meta, "name"),
        email: data.user.email ?? "",
        role: getString(meta, "role") ?? "IMPORTER",
        companyName: getString(meta, "companyName"),
        country: getString(meta, "country"),
        phone: getString(meta, "phone"),
        website: getString(meta, "website"),
        verified: null,
        avatar: null,
      };
    }

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
