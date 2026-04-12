import { NextRequest, NextResponse } from "next/server";
import { nhost } from "@/lib/nhost";
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

    // In Nhost v4 SDK, we use changePassword which works for the currently authenticated user
    const result = await nhost.auth.changePassword({ newPassword: password });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
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
