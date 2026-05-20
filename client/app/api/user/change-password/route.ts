export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getApiAuthContext, AUTH_COOKIE_NAME } from "@/lib/auth-server";
import { cookies } from "next/headers";

/**
 * POST /api/user/change-password
 * Changes the password for the currently authenticated user via Nhost API.
 */
export async function POST(request: NextRequest) {
  try {
    const { auth, error: authError } = await getApiAuthContext(request);
    if (authError || !auth) {
      return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
    const region = process.env.NEXT_PUBLIC_NHOST_REGION;

    if (!subdomain || !region) {
      return NextResponse.json({ error: "Nhost configuration missing" }, { status: 500 });
    }

    // Get the current access token
    const cookieStore = cookies();
    const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Use Nhost REST API to change password
    const changeRes = await fetch(
      `https://${subdomain}.auth.${region}.nhost.run/v1/user/password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      }
    );

    if (!changeRes.ok) {
      const errorData = await changeRes.json().catch(() => ({}));
      console.error("[ChangePassword] Nhost error:", changeRes.status, errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to change password" },
        { status: changeRes.status }
      );
    }

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error: any) {
    console.error("[ChangePassword] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
