import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { registerSchema } from "@/lib/validations";
import { createSupabaseRouteClient } from "@/lib/supabase/route";



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

    // Persist the profile (especially role) using Prisma when available. This avoids relying on
    // Supabase RLS policies for writes to the `users` table (which would otherwise leave role at
    // the Prisma default).
    try {
      const prismaModule = await import("@/lib/prisma");
      await prismaModule.prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          companyName: validatedData.companyName,
          country: validatedData.country,
          phone: validatedData.phone,
          website: validatedData.website,
        },
        create: {
          id: data.user.id,
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          companyName: validatedData.companyName,
          country: validatedData.country,
          phone: validatedData.phone,
          website: validatedData.website,
          verified: false,
        },
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
    } catch (e) {
      console.warn("Prisma upsert skipped/unavailable:", e);
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

    const profile = {
      id: data.user.id,
      name: validatedData.name ?? null,
      email: data.user.email ?? validatedData.email,
      role: validatedData.role,
    };

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
