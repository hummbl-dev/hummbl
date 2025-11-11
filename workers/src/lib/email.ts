/**
 * Email Service using Cloudflare Email Workers
 * 
 * Handles sending transactional emails through Cloudflare's email routing
 * 
 * @module workers/lib/email
 * @version 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('EmailService');

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using fetch to SMTP endpoint
 * For Cloudflare Workers, we'll use a simple fetch-based approach
 */
export async function sendEmail(options: EmailOptions, env: any): Promise<boolean> {
  try {
    // For now, we'll use console logging for development
    // In production, integrate with Resend API (free tier: 100 emails/day)
    // or configure Cloudflare Email Routing with a send endpoint
    
    const fromEmail = env.FROM_EMAIL || 'noreply@hummbl.workers.dev';
    
    logger.info('Sending email', {
      to: options.to,
      subject: options.subject,
      from: fromEmail,
    });

    // If RESEND_API_KEY is configured, use Resend
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html || options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Failed to send email via Resend', { error, status: response.status });
        return false;
      }

      logger.info('Email sent successfully via Resend', { to: options.to });
      return true;
    }

    // Fallback: Log email content (development mode)
    logger.warn('No email provider configured. Email would have been sent:', {
      to: options.to,
      subject: options.subject,
      preview: options.text.substring(0, 100),
    });
    
    // In development, always return true so the flow continues
    return true;
  } catch (error) {
    logger.error('Email send failed', error);
    return false;
  }
}

/**
 * Generate verification email HTML
 */
export function generateVerificationEmail(
  name: string,
  verificationUrl: string
): { subject: string; text: string; html: string } {
  const subject = 'Verify Your HUMMBL Account';
  
  const text = `
Hello ${name || 'there'}!

Thanks for signing up for HUMMBL. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.

Best regards,
The HUMMBL Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HUMMBL</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'there'}!</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thanks for signing up for HUMMBL. To get started, please verify your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${verificationUrl}" 
         style="display: inline-block; background: #0369a1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      This link will expire in 24 hours.
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationUrl}" style="color: #0369a1; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© 2025 HUMMBL. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetEmail(
  name: string,
  resetUrl: string
): { subject: string; text: string; html: string } {
  const subject = 'Reset Your HUMMBL Password';
  
  const text = `
Hello ${name || 'there'}!

We received a request to reset your password for your HUMMBL account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The HUMMBL Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'there'}!</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We received a request to reset the password for your HUMMBL account.
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; background: #0369a1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      This link will expire in 1 hour.
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #0369a1; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© 2025 HUMMBL. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
