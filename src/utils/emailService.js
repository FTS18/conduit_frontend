/**
 * Email Service Configuration
 * Uses backend SMTP with automatic failover across 5 accounts
 */

import { supabase } from '../supabaseClient';

// Email templates
const emailTemplates = {
  passwordReset: (resetLink, userName) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hi ${userName || 'User'},</p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password. 
            This link will expire in 1 hour.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            Or copy this link: <a href="${resetLink}" style="color: #0066cc;">${resetLink}</a>
          </p>
          
          <p style="color: #999; font-size: 13px; margin-top: 20px;">
            If you didn't request a password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>© 2025 Conduit. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Password Reset Request\n\nHi ${userName || 'User'},\n\nClick the link below to reset your password (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\n© 2025 Conduit`
  }),

  confirmEmail: (verificationLink, userName) => ({
    subject: 'Confirm Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hi ${userName || 'User'},</p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Conduit! Please verify your email address by clicking the button below.
            This confirms that you own this email and want to use it for your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            Or copy this link: <a href="${verificationLink}" style="color: #0066cc;">${verificationLink}</a>
          </p>
          
          <p style="color: #999; font-size: 13px; margin-top: 20px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>© 2025 Conduit. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Verify Your Email\n\nHi ${userName || 'User'},\n\nClick the link below to verify your email:\n${verificationLink}\n\nThis link expires in 24 hours.\n\n© 2025 Conduit`
  }),

  welcomeEmail: (userName) => ({
    subject: 'Welcome to Conduit!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Conduit!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hi ${userName || 'User'},</p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Your account has been successfully created! You're now ready to start sharing and discovering amazing content.
          </p>
          
          <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Getting Started:</h3>
          <ul style="color: #555; font-size: 14px; line-height: 1.8;">
            <li><strong>Complete Your Profile:</strong> Add a bio, profile picture, and location</li>
            <li><strong>Find Articles:</strong> Explore content from writers in your favorite topics</li>
            <li><strong>Connect:</strong> Follow users whose content you enjoy</li>
            <li><strong>Share:</strong> Write articles and share your thoughts with the community</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://conduit.productionready.io" style="display: inline-block; background: #0066cc; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Go to Conduit
            </a>
          </div>
          
          <p style="color: #999; font-size: 13px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>© 2025 Conduit. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to Conduit!\n\nHi ${userName || 'User'},\n\nYour account is ready! Start exploring and sharing content.\n\n© 2025 Conduit`
  })
};

/**
 * Backend SMTP Email Service with Automatic Failover
 * Tries multiple SMTP accounts - if one fails, uses the next automatically
 */
class BackendEmailService {
  async sendPasswordReset(email, userName, resetToken) {
    try {
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      const template = emailTemplates.passwordReset(resetLink, userName);

      const response = await fetch('/api/email/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName,
          resetToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      console.log('[EMAIL_SERVICE] Password reset email queued for:', email);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL_SERVICE] Password reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendConfirmationEmail(email, userName, verificationToken) {
    try {
      const verificationLink = `${window.location.origin}/confirm-email?token=${verificationToken}`;
      const template = emailTemplates.confirmEmail(verificationLink, userName);

      const response = await fetch('/api/email/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      console.log('[EMAIL_SERVICE] Confirmation email queued for:', email);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL_SERVICE] Confirmation email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const template = emailTemplates.welcomeEmail(userName);

      const response = await fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      console.log('[EMAIL_SERVICE] Welcome email queued for:', email);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL_SERVICE] Welcome email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmailStatus() {
    try {
      const response = await fetch('/api/email/status');
      if (!response.ok) throw new Error('Failed to get email status');
      return await response.json();
    } catch (error) {
      console.error('[EMAIL_SERVICE] Status check failed:', error);
      return { service: 'unknown', error: error.message };
    }
  }
}

// Export singleton instance
export const emailService = new BackendEmailService();

// Export templates for reference
export { emailTemplates };
