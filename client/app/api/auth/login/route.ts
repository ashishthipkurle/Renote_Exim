export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginSchema } from "@/lib/validations";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    console.log("[Login] Attempting Supabase sign-in for:", validatedData.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error || !data.user || !data.session) {
      console.error("[Login] Supabase SDK threw error:", error?.message);
      return NextResponse.json(
        { error: error?.message || "Invalid email or password" }, 
        { status: 401 }
      );
    }

    // Fetch the user from our Prisma database to get their custom profile/role
    const dbUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found in database" },
        { status: 404 }
      );
    }

    const profile = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };

    // The Supabase SSR client automatically sets the cookies in the response
    // because we provided the setAll function using next/headers cookies()

    return NextResponse.json({
      message: "Login successful",
      user: profile,
      token: data.session.access_token,
    });

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
