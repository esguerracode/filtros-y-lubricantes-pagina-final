import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';
import { createOrder } from '../_utils/woo.js';
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
      const price = parseFloat(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + (price * qty);
    }, 0);

    if (calculatedTotal <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // 1. Create order in WooCommerce for stock management and persistence
    let wooOrderId: number | null = null;
    let reference = '';

    try {
      const wooOrder = await createOrder({
        payment_method: 'wompi',
        payment_method_title: 'Wompi (Bancolombia)',
        set_paid: false,
        status: 'pending',
        billing: {
          first_name: customer?.fullName || 'Cliente',
          email: customer?.email || '',
          phone: customer?.phoneNumber || '',
          city: customer?.city || '',
          address_1: customer?.address || ''
        },
        line_items: items.map((i: any) => ({
          product_id: i.id,
          quantity: Number(i.quantity) || 1
        }))
      });
      wooOrderId = wooOrder.id;
      reference = `WC-${wooOrderId}`;
    } catch (wooError: any) {
      console.error('WooCommerce creation failed, falling back to temporary reference:', wooError.message);
      // Fallback to random reference if WC fails (to avoid blocking the payment)
      reference = `FL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    const currency = 'COP';
    const amountInCents = copToCents(calculatedTotal);
    const signature = generateIntegritySignature(reference, amountInCents, currency);

    // CRITICAL: Fail fast si WOMPI_INTEGRITY_SECRET no está configurado en Vercel.
    // Sin firma válida, Wompi rechaza la transacción silenciosamente.
    if (!signature) {
      console.error('❌ WOMPI_INTEGRITY_SECRET no está configurado en las variables de entorno de Vercel.');
      return res.status(500).json({
        error: 'Error de configuración del servidor de pagos. Contacta al administrador.'
      });
    }

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
      `<b>Estado:</b> ⏳ Esperando pago Wompi`
    );

    console.log(`✅ Order: ${reference} | Total: ${calculatedTotal} COP | Cents: ${amountInCents}`);

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
