import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Mocking email send:', { to, subject });
    return { data: { id: 'mock-id' }, error: null };
  }

  const from = process.env.EMAIL_FROM || 'Elira Health <noreply@elirahealth.com>';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Error sending email via Resend:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return { data: null, error };
  }
}
