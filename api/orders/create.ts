import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';

async function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_USER_ID;
  if (!token || !chatId) {
    console.warn('⚠️ Telegram not configured. Skipping notification.');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
    if (!res.ok) console.error('Telegram API error:', await res.text());
  } catch (e) {
    console.error('Telegram send failed:', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { items, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    const calculatedTotal = items.reduce((acc: number, item: any) => {
      return acc + (parseFloat(item.price) * Number(item.quantity));
    }, 0);

    if (calculatedTotal <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    const reference = `FL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const currency = 'COP';
    const amountInCents = copToCents(calculatedTotal);
    const signature = generateIntegritySignature(reference, amountInCents, currency);

    // Robust name fallback: name || title || 'Producto'
    const itemsList = items
      .map((i: any) => {
        const productName = i.name || i.title || 'Producto';
        const qty = Number(i.quantity) || 1;
        const price = parseFloat(i.price) || 0;
        return `• ${productName} x${qty} = $${(price * qty).toLocaleString('es-CO')} COP`;
      })
      .join('\n');

    await sendTelegram(
      `🛒 <b>NUEVA ORDEN</b> #${reference}\n\n` +
      `<b>Cliente:</b> ${customer?.fullName || 'N/A'}\n` +
      `<b>Email:</b> ${customer?.email || 'N/A'}\n` +
      `<b>Tel:</b> ${customer?.phoneNumber || 'N/A'}\n` +
      `<b>Ciudad:</b> ${customer?.city || 'N/A'}\n\n` +
      `<b>Productos:</b>\n${itemsList}\n\n` +
      `<b>TOTAL: $${calculatedTotal.toLocaleString('es-CO')} COP</b>\n` +
      `<b>Estado:</b> ⏳ Pendiente de pago Wompi`
    );

    console.log(`✅ Order: ${reference} | Total: ${calculatedTotal} COP | AmountInCents: ${amountInCents}`);

    return res.status(200).json({
      reference,
      amountInCents,
      total: calculatedTotal.toString(),
      currency,
      key: reference,
      signature
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
