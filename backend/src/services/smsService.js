const Notification = require('../models/Notification');

/**
 * Send Normal Text SMS via Fast2SMS Quick Route using native fetch (No extra dependencies)
 * @param {string} toPhone - 10-digit mobile number
 * @param {string} message - Message text body
 * @param {object} metadata - businessId, workerId, notificationType
 */
const sendSMS = async ({ toPhone, message, metadata = {} }) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.log('[Fast2SMS Simulation] No API Key set. Simulated message:', message);
    return { success: false, note: 'Fast2SMS API Key not configured' };
  }

  // Clean phone number: take last 10 digits
  const cleanPhone = toPhone.replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    console.warn(`[Fast2SMS] Invalid mobile number: ${toPhone}`);
    return { success: false, note: 'Invalid 10-digit mobile number' };
  }

  try {
    const payload = {
      route: 'q', // Quick SMS route (No DLT required)
      message: message,
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    };

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const isSuccess = data && data.return === true;

    // Log notification in database
    if (metadata.businessId) {
      await Notification.create({
        businessId: metadata.businessId,
        workerId: metadata.workerId || null,
        title: metadata.title || 'SMS Sent',
        message: message,
        type: metadata.type || 'General',
        deliveryChannel: 'in_app',
        deliveryStatus: isSuccess ? 'delivered' : 'failed'
      }).catch(err => console.error('Failed to log SMS notification:', err));
    }

    console.log(`[Fast2SMS] Result for ${cleanPhone}:`, data);
    return { success: isSuccess, data };
  } catch (error) {
    console.error(`[Fast2SMS Error] Failed to send SMS to ${cleanPhone}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS
};
