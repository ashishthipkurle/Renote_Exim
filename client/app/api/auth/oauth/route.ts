export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

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

    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;

    if (!subdomain || !region) {
      return NextResponse.json(
        { error: "Nhost configuration missing" },
        { status: 500 }
      );
    }

    // Build the redirect URL for after OAuth completes
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${appUrl}/auth/callback`;

    // Nhost v4 OAuth sign-in URL
    let providerUrl = `https://${subdomain}.auth.${region}.nhost.run/v1/signin/provider/${provider}?redirectTo=${encodeURIComponent(redirectTo)}`;

    // Force Google to always show the account picker instead of auto-selecting previous account
    if (provider === "google") {
      providerUrl += "&prompt=consent";
    }

    return NextResponse.json({ providerUrl });
  } catch (error: any) {
    console.error("[OAuth] Error generating provider URL:", error);
    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
