export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, code, purpose = "LOGIN" } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent unused, unexpired OTP for this email+purpose
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No valid verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Clean up old OTP records for this email (keep things tidy)
    await prisma.otpCode.deleteMany({
      where: {
        email: normalizedEmail,
        OR: [
          { used: true },
          { expiresAt: { lt: new Date() } },
        ],
        id: { not: otpRecord.id },
      },
    }).catch(() => {}); // Non-critical cleanup

    return NextResponse.json({
      message: "Verification successful",
      verified: true,
    });
  } catch (error: any) {
    console.error("[verify-otp] Error:", error.message);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
