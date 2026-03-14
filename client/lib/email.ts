import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email delivery will be skipped.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
    return { data: { id: 'simulated' }, error: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || 'Ranote Exim <notifications@ranote-exim.com>',
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Email Send Exception:', error);
    return { data: null, error: error.message };
  }
}
