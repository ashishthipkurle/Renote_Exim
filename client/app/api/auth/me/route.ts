import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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

    const { supabase, applyCookies } = createSupabaseRouteClient(request);

    // Prefer bearer token if provided, else use cookie session.
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    let userDetailsResponse;

    if (token) {
      userDetailsResponse = await supabase.auth.getUser(token);
    } else {
      const sessionRes = await supabase.auth.getSession();
      if (sessionRes.data.session) {
        token = sessionRes.data.session.access_token;
        userDetailsResponse = await supabase.auth.getUser(token);
      } else {
        userDetailsResponse = { data: { user: null }, error: new Error("No session") };
      }
    }

    const { data: userData, error: userError } = userDetailsResponse;

    if (userError || !userData?.user) {
      const res = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return applyCookies(res);
    }

    let profile = null;

    // 1. Try Prisma First
    try {
      const { prisma } = await import("@/lib/prisma");
      const prismaUser = await prisma.user.findUnique({
        where: { id: userData.user.id },
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

      if (prismaUser) {
        profile = {
          ...prismaUser,
          role: String(prismaUser.role),
          createdAt: prismaUser.createdAt.toISOString(),
          updatedAt: prismaUser.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Prisma user lookup failed in /me:", e);
    }

    // 2. Fallback to Supabase Database
    if (!profile) {
      const { data: supaUser, error: supaError } = await supabase
        .from("users")
        .select("id,name,email,role,companyName,country,phone,website,verified,avatar,createdAt,updatedAt")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!supaError && supaUser) {
        const row = isRecord(supaUser) ? supaUser : {};
        const meta = isRecord(userData.user.user_metadata) ? userData.user.user_metadata : {};
        profile = {
          id: getString(row, "id") ?? userData.user.id,
          name: getString(row, "name"),
          email: getString(row, "email") ?? userData.user.email ?? "",
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
      }
    }

    // 3. Absolute Fallback to Supabase Auth Metadata
    if (!profile) {
      const meta = isRecord(userData.user.user_metadata) ? userData.user.user_metadata : {};
      profile = {
        id: userData.user.id,
        name: getString(meta, "name"),
        email: userData.user.email ?? "",
        role: getString(meta, "role") ?? "IMPORTER",
        companyName: getString(meta, "companyName"),
        country: getString(meta, "country"),
        phone: getString(meta, "phone"),
        website: getString(meta, "website"),
        verified: null,
        avatar: null,
      };
    }

    const res = NextResponse.json({ user: profile });
    return applyCookies(res);

  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing Supabase env")) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
