/**
 * Brevo (Sendinblue) Transactional Email Service
 * High-priority direct inbox delivery with unique timestamp tracking and threading prevention
 */

const sendEmailOTP = async ({ toEmail, toName, otp, businessName, purpose = 'signup' }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'warshasingh21@gmail.com';
  const senderName = process.env.SENDER_NAME || 'KaamSetu';

  if (!apiKey) {
    console.warn('[Brevo Simulation] BREVO_API_KEY is not set. OTP:', otp);
    return { success: true, simulated: true };
  }

  const isPasswordReset = purpose === 'forgot_password';
  const timestampStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

  // Unique subject with timestamp ensures Gmail treats each OTP as a brand-new FRESH email thread (top of inbox)
  const subject = isPasswordReset
    ? `[${otp}] Your KaamSetu Password Reset Code - ${timestampStr}`
    : `[${otp}] Your KaamSetu Verification Code - ${timestampStr}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KaamSetu Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F5F7; margin: 0; padding: 20px; color: #172B4D;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #DFE1E6; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(9,30,66,0.08);">
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #172B4D; padding: 22px 28px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">
                KaamSetu <span style="font-size: 13px; font-weight: 400; opacity: 0.85;">कामसेतु</span>
              </h1>
              <p style="color: #EBECF0; margin: 4px 0 0 0; font-size: 11px;">Labour, Attendance & Ledger Management SaaS</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 28px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #172B4D; margin: 0 0 10px 0;">
                Namaste ${toName || 'User'},
              </h2>
              <p style="font-size: 13px; line-height: 1.5; color: #5E6C84; margin: 0 0 18px 0;">
                ${isPasswordReset ? 'Use the OTP code below to reset your KaamSetu account password:' : `Use this One-Time Password (OTP) to verify your account${businessName ? ` for <strong>${businessName}</strong>` : ''}:`}
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #F4F5F7; border: 2px dashed #172B4D; border-radius: 4px; padding: 16px; text-align: center; margin: 18px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #172B4D; display: inline-block;">
                  ${otp}
                </span>
                <p style="font-size: 11px; color: #7A869A; margin: 6px 0 0 0;">Valid for 10 minutes (Requested at ${timestampStr})</p>
              </div>
              
              <p style="font-size: 11px; color: #7A869A; line-height: 1.4; margin: 16px 0 0 0;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Tracking Footer -->
          <tr>
            <td style="background-color: #FAFBFC; padding: 12px 28px; border-top: 1px solid #EBECF0; text-align: center; font-size: 10px; color: #7A869A;">
              Timestamp: ${dateStr} ${timestampStr} IST • Ref: ${Date.now()}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: toEmail,
        name: toName || 'User'
      }
    ],
    subject: subject,
    htmlContent: htmlContent,
    headers: {
      'X-Priority': '1', // High Priority
      'Importance': 'high',
      'X-MSMail-Priority': 'High'
    },
    tags: [purpose, 'kaamsetu_otp']
  };

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const elapsedMs = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error(`[Brevo API Error in ${elapsedMs}ms]:`, data);
      return { success: false, error: data.message || 'Brevo dispatch error' };
    }

    console.log(`✓ Brevo OTP dispatched in ${elapsedMs}ms to ${toEmail} | Code: ${otp} | MessageId: ${data.messageId}`);
    return { success: true, messageId: data.messageId, elapsedMs };
  } catch (error) {
    console.error('[Brevo Dispatch Failure]:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmailOTP };
