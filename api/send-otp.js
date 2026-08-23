export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { to, code, name, type } = body || {};

    if (!to || !code) {
      return res.status(400).json({ error: 'Missing recipient email or verification code' });
    }

    const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Resend API key is not configured on server' });
    }

    const isSignup = type === 'signup';
    const heading = isSignup ? 'Verify Your Student Account' : 'Your CampusSparks Login Code';
    const studentName = name || 'Student';
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CampusSparks <auth@campussparks.com>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Resend delivery failed', data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
