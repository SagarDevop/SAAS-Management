const Notification = require('../models/Notification');

/**
 * Send WhatsApp Notification via Official Meta WhatsApp Cloud API
 * @param {string} toPhone - 10 digit recipient mobile number
 * @param {string} textMessage - Message content body
 * @param {object} metadata - businessId, workerId, notificationType
 */
const sendWhatsAppMessage = async ({ toPhone, textMessage, metadata = {} }) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.log('[WhatsApp Cloud API Simulation] Token or Phone ID not set.');
    return { success: false, note: 'WhatsApp credentials missing' };
  }

  // Clean phone number: Indian numbers format as 91XXXXXXXXXX
  let cleanPhone = toPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  try {
    // Meta WhatsApp Cloud API supports freeform text messages or official hello_world template
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: textMessage
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
    const isSuccess = response.ok && !!data.messages;

    if (metadata.businessId) {
      await Notification.create({
        businessId: metadata.businessId,
        workerId: metadata.workerId || null,
        title: metadata.title || 'WhatsApp Message',
        message: textMessage,
        type: metadata.type || 'General',
        deliveryChannel: 'whatsapp',
        deliveryStatus: isSuccess ? 'delivered' : 'failed'
      }).catch(err => console.error('Failed to log WhatsApp notification:', err));
    }

    if (isSuccess) {
      console.log(`[WhatsApp Success] Delivered to ${cleanPhone}:`, data);
    } else {
      console.error(`[WhatsApp API Error] for ${cleanPhone}:`, data);
    }

    return { success: isSuccess, data };
  } catch (error) {
    console.error(`[WhatsApp Network Error] to ${cleanPhone}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppMessage
};
