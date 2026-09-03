export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/oauth?provider=google|linkedin
 * Returns the Nhost OAuth provider sign-in URL for client-side redirect.
 */
export async function GET(request: NextRequest) {
  try {
    const provider = request.nextUrl.searchParams.get("provider");

    if (!provider || !["google", "linkedin"].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid or missing provider. Use 'google' or 'linkedin'." },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${appUrl}/api/auth/callback`;

    const supabaseProvider = provider === "linkedin" ? "linkedin_oidc" : provider;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as any,
      options: {
        redirectTo,
        queryParams: provider === "google" ? { prompt: "consent" } : undefined
      },
    });

    if (error) {
      console.error("[OAuth] Error getting Supabase OAuth URL:", error);
      return NextResponse.json(
        { error: "Failed to generate OAuth URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ providerUrl: data.url });
  } catch (error: any) {
    console.error("[OAuth] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
