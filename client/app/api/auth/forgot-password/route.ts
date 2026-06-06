export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/validations";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const validatedData = forgotPasswordSchema.parse(body);

 const host = request.headers.get("host");
 const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
 const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

 const cookieStore = cookies();
 const supabase = createServerClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
   {
     cookies: {
       getAll() { return cookieStore.getAll() },
       setAll(cookiesToSet) {
         cookiesToSet.forEach(({ name, value, options }) =>
           cookieStore.set(name, value, options)
         )
       },
     },
   }
 )

 const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
   redirectTo: `${appUrl}/reset-password`,
 });

 if (error) {
 return NextResponse.json(
 { error: error.message },
 { status: 400 }
 );
 }

 return NextResponse.json({
 message: "Password reset email sent. Please check your inbox.",
 });

 } catch (error) {
 if (error instanceof z.ZodError) {
 return NextResponse.json(
 { error: "Validation failed", details: error.errors },
 { status: 400 }
 );
 }

 console.error("Forgot password error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

