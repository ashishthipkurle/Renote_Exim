export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getApiAuthContext } from "@/lib/auth-server";

/**
 * POST /api/auth/reset-password
 * Handles password reset for the currently authenticated user session.
 * This is used when the user clicks a recovery link and is currently authenticated via the reset token.
 */
export async function POST(request: NextRequest) {
 try {
 const { auth, error: authError } = await getApiAuthContext(request);

 if (authError || !auth) {
 return authError || NextResponse.json({ error: "Unauthorized session for password reset" }, { status: 401 });
 }

 const { password } = await request.json();

 if (!password || password.length < 8) {
 return NextResponse.json(
 { error: "Password must be at least 8 characters long" },
 { status: 400 }
 );
 }

 // In Supabase, if the user clicked the reset link, they have an active session
 // so we can update their password.
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

 const { error } = await supabase.auth.updateUser({ password });

 if (error) {
 return NextResponse.json(
 { error: error.message },
 { status: 400 }
 );
 }

 return NextResponse.json({ message: "Password updated successfully" });

 } catch (error: any) {
 console.error("Reset password error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

