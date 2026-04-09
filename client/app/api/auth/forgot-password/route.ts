import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/validations";
import { nhost } from "@/lib/nhost";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const host = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // v4 SDK: sendPasswordResetEmail (not resetPassword)
    const { error } = await nhost.auth.sendPasswordResetEmail({
      email: validatedData.email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      }
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
