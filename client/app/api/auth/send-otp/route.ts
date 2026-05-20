export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, sendOtpEmail } from "@/lib/otp-email";

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = "LOGIN" } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: max 5 OTP requests per email per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await prisma.otpCode.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // Generate a 6-digit code
    const code = generateOtpCode();

    // Store in database with 10-minute expiry
    await prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send the email (or log to console in dev mode)
    const sent = await sendOtpEmail(normalizedEmail, code, purpose as any);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification code sent successfully",
      // In dev mode without SMTP, include the code so the dev can test
      ...((!process.env.SMTP_USER || !process.env.SMTP_PASS) && { devCode: code }),
    });
  } catch (error: any) {
    console.error("[send-otp] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
