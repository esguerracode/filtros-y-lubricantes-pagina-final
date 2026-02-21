/**
 * Wompi Webhook Handler
 * Recibe eventos de pago de Wompi y notifica por Telegram.
 * Sin dependencias externas: no WooCommerce, no Vercel KV.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateWompiSignature } from '../_utils/wompi.js';
import { sendTelegram } from '../_utils/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload = req.body;

    // 1. Validar firma de Wompi (seguridad)
    const isValid = validateWompiSignature(payload);

    // LOG TEMPORAL PARA DEBUGGING
    console.log('FIRMA VALIDA:', isValid);
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2));

    if (!isValid) {
      console.error('❌ Webhook: Firma inválida');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Extraer datos del evento basado en la estructura de Wompi
    const transaction = payload?.data?.transaction;
    if (!transaction) {
      console.log('⚠️ Webhook: No se encontró data.transaction en el body');
      return res.status(200).send('No transaction data');
    }

    const { status, reference, id, amount_in_cents, payment_method_type } = transaction;
    const amount = (amount_in_cents / 100).toLocaleString('es-CO');

    console.log(`📩 Webhook Wompi: ${reference} | Estado: ${status} | ID: ${id}`);

    // 3. Notificar por Telegram según el estado
    if (status === 'APPROVED') {
      await sendTelegram(
        `✅ <b>PAGO APROBADO</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>Método:</b> ${payment_method_type || 'N/A'}\n` +
        `<b>ID Wompi:</b> <code>${id}</code>\n\n` +
        `🚀 El pedido ya puede ser procesado.`
      );
    } else if (status === 'DECLINED' || status === 'ERROR') {
      await sendTelegram(
        `❌ <b>PAGO RECHAZADO</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Estado:</b> ${status}\n` +
        `<b>ID Wompi:</b> ${id}`
      );
    } else if (status === 'PENDING') {
      await sendTelegram(
        `⏳ <b>PAGO PENDIENTE</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>ID Wompi:</b> ${id}`
      );
    }

    return res.status(200).send('OK');

  } catch (error: any) {
    console.error('❌ Webhook Error:', error);
    return res.status(200).send('Error logged');
  }
}
