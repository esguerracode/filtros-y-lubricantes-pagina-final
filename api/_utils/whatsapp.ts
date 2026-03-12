/**
 * Utilidad para enviar mensajes de WhatsApp via Twilio API.
 */

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // formato: whatsapp:+14155238886

  if (!accountSid || !authToken || !fromWhatsApp) {
    console.warn('⚠️ Twilio no configurado. Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_WHATSAPP_FROM.');
    return false;
  }

  // Normalizar número destino (quitar espacios, guiones, agregar prefijo)
  let normalizedTo = to.replace(/[\s\-\(\)]/g, '');
  if (!normalizedTo.startsWith('+')) {
    if (normalizedTo.startsWith('57')) {
      normalizedTo = '+' + normalizedTo;
    } else {
      normalizedTo = '+57' + normalizedTo;
    }
  }

  const toWhatsApp = `whatsapp:${normalizedTo}`;

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromWhatsApp,
          To: toWhatsApp,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio WhatsApp error:', error);
      return false;
    }

    console.log('✅ WhatsApp enviado a', normalizedTo);
    return true;
  } catch (error) {
    console.error('Twilio WhatsApp send failed:', error);
    return false;
  }
}

export async function sendWhatsAppWithFallback(
  to: string,
  message: string,
  telegramMessage?: string
): Promise<void> {
  // Intentar WhatsApp primero
  const whatsappSent = await sendWhatsApp(to, message);

  // Si falla WhatsApp, intentar Telegram como backup
  if (!whatsappSent && telegramMessage) {
    console.log('📱 WhatsApp falló, intentando Telegram...');
    const { sendTelegram } = await import('./telegram.js');
    await sendTelegram(telegramMessage);
  }
}
