
const Notification = require('../models/Notification');

// In development or when WhatsApp credentials are not provided, dispatch acts in simulation mode.
// In production, configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env
const sendWhatsAppTemplateMessage = async ({ toPhone, templateType, params = {} }) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    // Graceful simulation: do not claim delivered unless provider responds
    return {
      success: false,
      status: 'pending',
      note: 'WhatsApp Business API credentials not configured in environment.'
    };
  }

  // Live Meta WhatsApp Cloud API integration payload
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: toPhone.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateType,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: Object.values(params).map(text => ({ type: 'text', text: String(text) }))
          }
        ]
      }
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, status: 'sent', data };
    } else {
      return { success: false, status: 'failed', error: data };
    }
  } catch (error) {
    return { success: false, status: 'failed', error: error.message };
  }
};

module.exports = {
  sendWhatsAppTemplateMessage
};
