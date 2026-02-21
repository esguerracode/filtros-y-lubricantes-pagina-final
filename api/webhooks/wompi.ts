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

    // === SUPER-DEBUG: Ver todos los headers que Wompi envía ===
    console.log('═══════════════════════════════════════════════════');
    console.log('📨 TODOS LOS HEADERS RECIBIDOS:');
    console.log(JSON.stringify(req.headers, null, 2));
    console.log('═══════════════════════════════════════════════════');
    console.log('📦 PAYLOAD COMPLETO:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('═══════════════════════════════════════════════════');

    const rawSig = req.headers['x-event-signature'] || req.headers['x-signature'];

    // Parsear la firma — Wompi la envía como JSON string
    let parsedSig: any;
    try {
      parsedSig = typeof rawSig === 'string' ? JSON.parse(rawSig as string) : rawSig;
    } catch {
      parsedSig = rawSig;
    }

    // Log para debugging en Vercel (remover después de confirmar)
    console.log('📨 Webhook payload event:', payload?.event);
    console.log('📨 Webhook transaction status:', payload?.data?.transaction?.status);
    console.log('📨 Signature checksum recibido:', parsedSig?.checksum || rawSig);

    // 1. Validar firma de Wompi (seguridad)
    if (!validateWompiSignature(payload, parsedSig)) {
      console.error('❌ Firma inválida. Checksum recibido:', parsedSig?.checksum);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { data } = payload;
    const { transaction } = data;
    const ref = transaction.reference;
    const eventId = transaction.id;
    const status = transaction.status;

    console.log(`📩 Webhook recibido: ${ref} | Estado: ${status} | ID: ${eventId}`);

    // 2. Notificar por Telegram según el resultado
    const amount = (transaction.amount_in_cents / 100).toLocaleString('es-CO');

    if (status === 'APPROVED') {
      await sendTelegram(
        `✅ <b>PAGO APROBADO</b>\n\n` +
        `<b>Orden:</b> ${ref}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>Método:</b> ${transaction.payment_method_type || 'N/A'}\n` +
        `<b>ID Wompi:</b> <code>${eventId}</code>\n\n` +
        `🚀 El pedido ya puede ser procesado y despachado.`
      );
    } else if (status === 'DECLINED' || status === 'ERROR') {
      await sendTelegram(
        `❌ <b>PAGO RECHAZADO</b>\n\n` +
        `<b>Orden:</b> ${ref}\n` +
        `<b>Estado:</b> ${status}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>ID Wompi:</b> ${eventId}`
      );
    } else if (status === 'PENDING') {
      await sendTelegram(
        `⏳ <b>PAGO PENDIENTE</b>\n\n` +
        `<b>Orden:</b> ${ref}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>ID Wompi:</b> ${eventId}`
      );
    } else if (status === 'VOIDED') {
      await sendTelegram(
        `⚠️ <b>PAGO ANULADO</b>\n\n` +
        `<b>Orden:</b> ${ref}\n` +
        `<b>ID Wompi:</b> ${eventId}`
      );
    }

    console.log(`✅ Webhook procesado: ${ref} → ${status}`);
    return res.status(200).send('OK');

  } catch (error: any) {
    console.error('Webhook Error:', error);
    // Retornar 200 para que Wompi no reintente
    return res.status(200).send('Error logged');
  }
}
