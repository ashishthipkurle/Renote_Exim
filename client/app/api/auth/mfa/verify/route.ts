import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  try {
    const { factorId, code } = await request.json();

    if (!factorId || !code) {
      return NextResponse.json({ error: "factorId and code are required" }, { status: 400 });
    }

    const { supabase } = createSupabaseRouteClient(request);

    // 1. Create a challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      return NextResponse.json({ error: challengeError.message }, { status: 400 });
    }

    // 2. Verify the challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return NextResponse.json({ error: verifyError.message }, { status: 400 });
    }

    // Success - factor is now verified/active
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { prisma } = await import('@/lib/prisma');
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (dbUser) {
          const prefs = (dbUser.emailPreferences as any) || { security: true };
          if (prefs.security !== false) {
            const { sendEmail } = await import('@/lib/email');
            const { SecurityAlertEmail } = await import('@/components/emails/SecurityAlert');
            const React = await import('react');

            await sendEmail({
              to: dbUser.email,
              subject: 'Security Alert: MFA Enabled',
              react: React.createElement(SecurityAlertEmail, {
                userName: dbUser.name || 'Valued Customer',
                alertType: 'MFA_ENABLED',
                details: 'Multi-Factor Authentication (TOTP) has been successfully enabled for your account.',
              }),
            });
          }
        }
      }
    } catch (emailErr) {
      console.error('Failed to send MFA security alert email:', emailErr);
    }

    return NextResponse.json(verifyData);

  } catch (error) {
    console.error("MFA verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
