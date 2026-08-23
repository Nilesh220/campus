// ============================================================
// CampusSparks — Resend Email Delivery Service
// Real API Integration with Resend Gateway + Smart Fallback
// ============================================================

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const EmailService = {
  /**
   * Send an email via Resend API
   */
  async sendEmail({ to, subject, html, from = 'CampusSparks <onboarding@resend.dev>' }: SendEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!RESEND_API_KEY) {
      return { success: false, error: 'Resend API key unconfigured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn('Resend API response warning:', result);
        return { success: false, error: result.message || 'Domain unverified or restricted by Resend' };
      }

      return { success: true, data: result };
    } catch (err: any) {
      console.warn('Resend network dispatch error:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  },

  /**
   * Send 6-digit Student Verification Code Email
   */
  async sendVerificationCode(toEmail: string, code: string, studentName: string = 'Student'): Promise<{ success: boolean; code: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0e131f; color: #f1f5f9; padding: 36px 28px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 26px; font-weight: 800; color: #0D9488; letter-spacing: -0.5px;">CampusSparks</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; text-align: center;">Verify Your Student Account</h2>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 24px;">
          Hey ${studentName}, welcome to CampusSparks! Enter the 6-digit confirmation code below to verify your student account:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: rgba(13, 148, 136, 0.12); border: 2px solid #0D9488; padding: 14px 32px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0D9488;">
            ${code}
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 28px; border-top: 1px solid #1e293b; padding-top: 16px;">
          This code is valid for 15 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    `;

    const res = await this.sendEmail({
      to: toEmail,
      subject: `🎓 Your CampusSparks Verification Code: ${code}`,
      html,
    });

    return {
      success: res.success,
      code,
      error: res.error,
    };
  }
};
