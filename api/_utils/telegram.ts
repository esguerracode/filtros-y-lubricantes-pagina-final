/**
 * Utilidad compartida para notificaciones de Telegram.
 * Usada por: api/orders/create.ts, api/webhooks/wompi.ts
 */

export async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_USER_ID;

  if (!token || !chatId) {
    console.warn('⚠️ Telegram no configurado. Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Telegram API error:', body);
    }
  } catch (e) {
    console.error('Telegram send failed:', e);
  }
}
