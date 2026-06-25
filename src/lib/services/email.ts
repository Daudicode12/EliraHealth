// src/lib/services/email.ts
import nodemailer from 'nodemailer';

/**
 * Send specialist credentials email
 */
export async function sendSpecialistCredentialsEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  tempPassword: string;
  loginUrl: string; // e.g., "https://elira-health.com/login"
}): Promise<void> {
  const { email, firstName, lastName, tempPassword, loginUrl } = data;

  const emailBody = `Welcome to Elira Health - Your Specialist Account

Dear Dr. ${firstName} ${lastName},

You have been added as a specialist on the Elira Health platform.

Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}
Temporary Password: ${tempPassword}
Login: ${loginUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT:
• Please change your password after your first login
• Do not share your credentials
• Contact admin if you experience issues

Need help? Reply to this email or contact support.

Best regards,
Elira Health Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #6b46c1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Welcome to Elira Health</h2>
      <p>Dear Dr. ${firstName} ${lastName},</p>
      <p>You have been added as a specialist on the Elira Health platform.</p>
      
      <div style="background-color: #f7fafc; border-left: 4px solid #6b46c1; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin-top: 0; color: #4a5568;">Your Login Credentials:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 120px;">Email:</td>
            <td style="padding: 4px 0; color: #2d3748;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 120px;">Password:</td>
            <td style="padding: 4px 0; font-family: monospace; font-size: 1.1em; color: #2d3748;"><strong>${tempPassword}</strong></td>
          </tr>
        </table>
        <p style="margin-bottom: 0; margin-top: 15px;">
          <a href="${loginUrl}" style="background-color: #6b46c1; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Log In Now</a>
        </p>
      </div>

      <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 0.9em; color: #7b341e;">
        <p style="margin: 0; font-weight: bold;">⚠️ IMPORTANT SECURITY WARNING:</p>
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>Please change your password after your first login.</li>
          <li>Do not share your credentials with anyone.</li>
          <li>Contact an admin immediately if you experience issues.</li>
        </ul>
      </div>

      <p style="font-size: 0.9em; color: #718096; margin-top: 30px;">
        Need help? Reply to this email or contact support.<br/>
        Best regards,<br/>
        <strong>Elira Health Team</strong>
      </p>
    </div>
  `;

  console.log(`[Email Attempt] Sending specialist credentials email to ${email}`);
  console.log(`-----------------------------------------`);
  console.log(`To: ${email}`);
  console.log(`Subject: Welcome to Elira Health - Your Specialist Account`);
  console.log(`Password: ${tempPassword}`);
  console.log(`Login URL: ${loginUrl}`);
  console.log(`-----------------------------------------`);

  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "Elira Health <noreply@elira-health.com>";

  if (!host || !user || !pass) {
    console.warn(`[Email Service] SMTP configuration missing. Email not sent, logged above.`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Welcome to Elira Health - Your Specialist Account",
      text: emailBody,
      html: emailHtml,
    });

    console.log(`[Email Service] Credentials email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
    // Graceful handling: log it but do not throw error so DB operations are not rolled back unnecessarily
  }
}

/**
 * Send email when doctor account is approved
 */
export async function sendDoctorApprovalEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  loginUrl: string;
}): Promise<void> {
  const { email, firstName, lastName, loginUrl } = data;

  const emailBody = `Welcome to Elira Health - Your Account is Verified!

Dear Dr. ${firstName} ${lastName},

We are pleased to inform you that your specialist account on Elira Health has been verified and approved by our administration team.

You can now log in to your dashboard to complete your profile setup, schedule consultations, and start consulting with patients.

Login Url: ${loginUrl}

Best regards,
Elira Health Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #22c55e; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Account Verified!</h2>
      <p>Dear Dr. ${firstName} ${lastName},</p>
      <p>We are pleased to inform you that your specialist account on Elira Health has been verified and approved by our administration team.</p>
      <p>You can now log in to your dashboard to start consulting with patients.</p>
      
      <div style="margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Specialist Dashboard</a>
      </div>

      <p style="font-size: 0.9em; color: #718096; margin-top: 30px;">
        Need help? Reply to this email or contact support.<br/>
        Best regards,<br/>
        <strong>Elira Health Team</strong>
      </p>
    </div>
  `;

  console.log(`[Email Attempt] Sending specialist approval email to ${email}`);
  console.log(`-----------------------------------------`);
  console.log(`To: ${email}`);
  console.log(`Subject: Elira Health - Account Verified!`);
  console.log(`-----------------------------------------`);

  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "Elira Health <noreply@elira-health.com>";

  if (!host || !user || !pass) {
    console.warn(`[Email Service] SMTP configuration missing. Email not sent, logged above.`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Elira Health - Account Verified!",
      text: emailBody,
      html: emailHtml,
    });

    console.log(`[Email Service] Approval email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
  }
}

/**
 * Send email when doctor account is rejected
 */
export async function sendDoctorRejectionEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
  profileUrl: string;
}): Promise<void> {
  const { email, firstName, lastName, reason, profileUrl } = data;

  const emailBody = `Elira Health - Specialist Application Status

Dear Dr. ${firstName} ${lastName},

Thank you for your interest in joining Elira Health. After careful review of your clinical credentials, we regret to inform you that we cannot approve your application at this time.

Reason for rejection:
"${reason}"

If you believe this is in error, or if you would like to update your credentials and resubmit your application, please log in and update your details.

Profile Url: ${profileUrl}

Best regards,
Elira Health Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ef4444; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Application Status Update</h2>
      <p>Dear Dr. ${firstName} ${lastName},</p>
      <p>Thank you for your interest in joining Elira Health. After careful review of your clinical credentials, we regret to inform you that we cannot approve your application at this time.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; color: #991b1b;">
        <h4 style="margin-top: 0; color: #991b1b;">Reason for Rejection:</h4>
        <p style="margin: 0; font-style: italic;">"${reason}"</p>
      </div>

      <p>If you would like to update your clinical credentials and resubmit your application for verification, please use the link below:</p>
      
      <div style="margin: 30px 0;">
        <a href="${profileUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Update Profile & Resubmit</a>
      </div>

      <p style="font-size: 0.9em; color: #718096; margin-top: 30px;">
        Best regards,<br/>
        <strong>Elira Health Team</strong>
      </p>
    </div>
  `;

  console.log(`[Email Attempt] Sending specialist rejection email to ${email}`);
  console.log(`-----------------------------------------`);
  console.log(`To: ${email}`);
  console.log(`Subject: Elira Health - Specialist Application Status`);
  console.log(`Reason: ${reason}`);
  console.log(`-----------------------------------------`);

  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "Elira Health <noreply@elira-health.com>";

  if (!host || !user || !pass) {
    console.warn(`[Email Service] SMTP configuration missing. Email not sent, logged above.`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Elira Health - Specialist Application Status",
      text: emailBody,
      html: emailHtml,
    });

    console.log(`[Email Service] Rejection email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
  }
}

/**
 * Send email when admin requests more info from specialist
 */
export async function sendDoctorInfoRequestEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  profileUrl: string;
}): Promise<void> {
  const { email, firstName, lastName, message, profileUrl } = data;

  const emailBody = `Elira Health - Additional Information Required for Verification

Dear Dr. ${firstName} ${lastName},

Our administration team has reviewed your specialist application and requires additional credentials or information before we can proceed with approval.

Requested Information:
"${message}"

Please click the link below to log in and update your clinical profile details as requested.

Profile Url: ${profileUrl}

Best regards,
Elira Health Team`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #d97706; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Additional Information Required</h2>
      <p>Dear Dr. ${firstName} ${lastName},</p>
      <p>Our administration team has reviewed your specialist application and requires additional credentials or information before we can proceed with approval.</p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px; color: #92400e;">
        <h4 style="margin-top: 0; color: #92400e;">Requested Details / Feedback:</h4>
        <p style="margin: 0; font-style: italic;">"${message}"</p>
      </div>

      <p>Please click the link below to log in and update your clinical profile details as requested:</p>
      
      <div style="margin: 30px 0;">
        <a href="${profileUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Provide Additional Information</a>
      </div>

      <p style="font-size: 0.9em; color: #718096; margin-top: 30px;">
        Best regards,<br/>
        <strong>Elira Health Team</strong>
      </p>
    </div>
  `;

  console.log(`[Email Attempt] Sending specialist info request email to ${email}`);
  console.log(`-----------------------------------------`);
  console.log(`To: ${email}`);
  console.log(`Subject: Elira Health - Additional Information Required`);
  console.log(`Request: ${message}`);
  console.log(`-----------------------------------------`);

  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "Elira Health <noreply@elira-health.com>";

  if (!host || !user || !pass) {
    console.warn(`[Email Service] SMTP configuration missing. Email not sent, logged above.`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Elira Health - Additional Information Required",
      text: emailBody,
      html: emailHtml,
    });

    console.log(`[Email Service] Info request email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${email}:`, error);
  }
}
