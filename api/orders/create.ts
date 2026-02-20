/**
 * Endpoint: POST /api/orders/create
 * Genera la referencia, firma de integridad y notifica por Telegram.
 * Sin WooCommerce. Todo en Vercel.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';
import { sendTelegram } from '../_utils/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    const reference = `FYL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const currency = 'COP';
    const amountInCents = copToCents(calculatedTotal);
    const signature = generateIntegritySignature(reference, amountInCents, currency);

    // Fail fast si WOMPI_INTEGRITY_SECRET no está configurado
    if (!signature) {
      console.error('❌ WOMPI_INTEGRITY_SECRET no configurado en Vercel Environment Variables');
      return res.status(500).json({
        error: 'Error de configuración del servidor de pagos. Contacta al administrador.'
      });
    }

    const itemsList = items
      .map((i: any) => {
        const name = i.name || i.title || 'Producto';
        const qty = Number(i.quantity) || 1;
        const price = parseFloat(i.price) || 0;
        return `• ${name} x${qty} = $${(price * qty).toLocaleString('es-CO')} COP`;
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
      `<b>Estado:</b> ⏳ Esperando pago Wompi`
    );

    console.log(`✅ Orden: ${reference} | Total: ${calculatedTotal} COP | Cents: ${amountInCents}`);

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
