import nodemailer from "nodemailer";

/**
 * Email transporter for OTP delivery.
 * Uses Gmail SMTP by default. Configure these env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * 
 * For Gmail: use an App Password (not your regular password).
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM=your-email@gmail.com
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Generate a random 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send an OTP email to the specified address.
 * If SMTP is not configured, logs the code to server console (dev mode).
 */
export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "LOGIN" | "REGISTER" | "PHONE_VERIFY" = "LOGIN"
): Promise<boolean> {
  // If SMTP is not configured, log the code to console (dev mode)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n========================================`);
    console.log(`  OTP CODE for ${to}: ${code}`);
    console.log(`  Purpose: ${purpose}`);
    console.log(`  (Configure SMTP_USER and SMTP_PASS in .env to send real emails)`);
    console.log(`========================================\n`);
    return true;
  }

  const purposeLabels: Record<string, string> = {
    LOGIN: "Login Verification",
    REGISTER: "Account Registration",
    PHONE_VERIFY: "Phone Number Verification",
  };

  const subject = `Ranote Exim — ${purposeLabels[purpose] || "Verification"} Code: ${code}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Ranote<span style="color: #D4AF37;">Exim</span></h1>
        <p style="color: #666; font-size: 13px; margin-top: 4px;">Global Trade Platform</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; border: 1px solid #eee;">
        <h2 style="color: #333; font-size: 18px; margin: 0 0 8px;">Verification Code</h2>
        <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
          Use the following code to complete your ${purposeLabels[purpose]?.toLowerCase() || "verification"}:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1a1a1a; background: #f5f5f5; padding: 16px 32px; border-radius: 8px; border: 2px dashed #D4AF37;">
            ${code}
          </span>
        </div>
        <p style="color: #999; font-size: 12px; margin: 24px 0 0; text-align: center;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      <p style="color: #999; font-size: 11px; text-align: center; margin-top: 16px;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@ranoteexim.com",
      to,
      subject,
      html,
    });
    console.log(`[OTP Email] Sent to ${to} for ${purpose}`);
    return true;
  } catch (error: any) {
    console.error(`[OTP Email] Failed to send to ${to}:`, error.message);
    return false;
  }
}
