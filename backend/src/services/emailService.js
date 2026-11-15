/**
 * Brevo (Sendinblue) Transactional Email Service
 * Sends branded OTP verification emails using native fetch (Zero extra dependencies)
 */

const sendEmailOTP = async ({ toEmail, toName, otp, businessName }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'warshasingh21@gmail.com';
  const senderName = process.env.SENDER_NAME || 'KaamSetu';

  if (!apiKey) {
    console.warn('[Brevo Simulation] BREVO_API_KEY is not set. OTP:', otp);
    return { success: true, simulated: true };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KaamSetu Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F5F7; margin: 0; padding: 24px; color: #172B4D;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #DFE1E6; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(9,30,66,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #172B4D; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                KaamSetu <span style="font-size: 13px; font-weight: 400; opacity: 0.85;">कामसेतु</span>
              </h1>
              <p style="color: #EBECF0; margin: 4px 0 0 0; font-size: 12px;">Labour, Attendance & Ledger Management SaaS</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #172B4D; margin: 0 0 12px 0;">
                Namaste ${toName || 'Business Owner'},
              </h2>
              <p style="font-size: 13px; line-height: 1.6; color: #5E6C84; margin: 0 0 20px 0;">
                Thank you for choosing <strong>KaamSetu</strong>${businessName ? ` for <strong>${businessName}</strong>` : ''}. Please use the following One-Time Password (OTP) to verify your Gmail and activate your SaaS workspace:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #F4F5F7; border: 2px dashed #172B4D; border-radius: 4px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #172B4D; display: inline-block;">
                  ${otp}
                </span>
                <p style="font-size: 11px; color: #7A869A; margin: 8px 0 0 0;">Valid for 10 minutes only</p>
              </div>
              
              <p style="font-size: 12px; color: #7A869A; line-height: 1.5; margin: 20px 0 0 0;">
                If you did not request this verification code, please ignore this email. Never share this code with anyone.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFBFC; padding: 16px 32px; border-top: 1px solid #EBECF0; text-align: center; font-size: 11px; color: #7A869A;">
              &copy; ${new Date().getFullYear()} KaamSetu SaaS Platform • All rights reserved.
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
    subject: `${otp} is your KaamSetu verification code`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Brevo API Error]:', data);
      return { success: false, error: data.message || 'Brevo dispatch error' };
    }

    console.log(`✓ Brevo OTP email sent to ${toEmail} (MessageId: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[Brevo Dispatch Failure]:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmailOTP };
