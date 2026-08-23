// ============================================================
// CampusSparks — Resend Email Delivery Service
// Real API Integration with Vercel Serverless + Resend Gateway
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
   * Send an email via Resend API (Direct Fallback)
   */
  async sendEmail({ to, subject, html, from = 'CampusSparks <auth@campussparks.com>' }: SendEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
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
  async sendVerificationCode(
    toEmail: string,
    code: string,
    studentName: string = 'Student',
    type: 'signup' | 'signin' = 'signup'
  ): Promise<{ success: boolean; code: string; error?: string }> {
    // 1. Try Vercel Serverless Function first (Bypasses browser CORS & protects key)
    try {
      const apiRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          code,
          name: studentName,
          type,
        }),
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        return { success: true, code, data: apiData } as any;
      }
    } catch (serverlessErr) {
      console.warn('Serverless endpoint not reachable, falling back to direct API:', serverlessErr);
    }

    // 2. Fallback to Direct Resend API
    const isSignup = type === 'signup';
    const heading = isSignup ? 'Verify Your Student Account' : 'Your CampusSparks Login Code';
    const subtext = isSignup
      ? `Hey ${studentName}, welcome to CampusSparks! Enter the 6-digit confirmation code below to verify your student account:`
      : `Hey ${studentName}, use the 6-digit one-time passcode below to securely sign in to your CampusSparks account:`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0e131f; color: #f1f5f9; padding: 36px 28px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 26px; font-weight: 800; color: #0D9488; letter-spacing: -0.5px;">✨ CampusSparks</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; text-align: center;">${heading}</h2>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 24px;">
          ${subtext}
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: rgba(13, 148, 136, 0.14); border: 2px solid #0D9488; padding: 14px 32px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0D9488;">
            ${code}
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 28px; border-top: 1px solid #1e293b; padding-top: 16px;">
          This code is valid for 15 minutes. If you did not request this, please safely ignore this email.
        </p>
      </div>
    `;

    const subject = isSignup
      ? `🎓 Your CampusSparks Verification Code: ${code}`
      : `🔑 Your CampusSparks Login Code: ${code}`;

    const res = await this.sendEmail({
      to: toEmail,
      subject,
      html,
    });

    return {
      success: res.success,
      code,
      error: res.error,
    };
  }
};
