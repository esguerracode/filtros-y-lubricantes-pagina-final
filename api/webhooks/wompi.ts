/**
 * Wompi Webhook Handler
 * Recibe eventos de pago de Wompi y notifica por Telegram y WhatsApp.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateWompiSignature } from '../_utils/wompi.js';
import { sendTelegram } from '../_utils/telegram.js';
import { sendWhatsApp } from '../_utils/whatsapp.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload = req.body;
    const isValid = validateWompiSignature(payload);

    console.log('FIRMA VALIDA:', isValid);
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2));

    if (!isValid) {
      console.error('❌ Webhook: Firma inválida');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const transaction = payload?.data?.transaction;
    if (!transaction) {
      console.log('⚠️ Webhook: No se encontró data.transaction en el body');
      return res.status(200).send('No transaction data');
    }

    const { status, reference, id, amount_in_cents, payment_method_type, payment_method } = transaction;
    const amount = (amount_in_cents / 100).toLocaleString('es-CO');
    const clientWhatsApp = process.env.CLIENT_WHATSAPP || '573143930345';

    // Extraer datos del cliente desde payment_method si están disponibles
    const customerPhone = payment_method?.phone?.number || '';
    const customerEmail = payment_method?.email || '';

    console.log(`📩 Webhook Wompi: ${reference} | Estado: ${status} | ID: ${id}`);

    // Notificaciones según el estado
    if (status === 'APPROVED') {
      // Telegram - Notificación completa al administrador
      await sendTelegram(
        `✅ <b>PAGO APROBADO</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>Método:</b> ${payment_method_type || 'N/A'}\n` +
        `<b>ID Wompi:</b> <code>${id}</code>\n` +
        `<b>Teléfono cliente:</b> ${customerPhone || 'No disponible'}\n` +
        `<b>Email cliente:</b> ${customerEmail || 'No disponible'}\n\n` +
        `🚀 El pedido ya puede ser procesado.`
      );

      // WhatsApp al cliente - Confirmación de compra
      const whatsappMessage = `🎉 *¡Pago Confirmado!*

Gracias por tu compra en *Filtros y Lubricantes del Llano*.

📋 *Detalles de tu orden:*
• *Referencia:* ${reference}
• *Monto:* $${amount} COP
• *Método de pago:* ${payment_method_type || 'No especificado'}
• *ID de transacción:* ${id}

🚚 *Próximo paso:*
Nuestro equipo procesará tu pedido y te contactará para confirmar los detalles de envío.

📞 *¿Tienes dudas?*
Escríbenos al WhatsApp: 314 393 0345

_Gracias por confiar en nosotros._`;

      await sendWhatsApp(customerPhone, whatsappMessage);

    } else if (status === 'DECLINED' || status === 'ERROR') {
      await sendTelegram(
        `❌ <b>PAGO RECHAZADO</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>Estado:</b> ${status}\n` +
        `<b>ID Wompi:</b> ${id}\n` +
        `<b>Teléfono:</b> ${customerPhone || 'No disponible'}`
      );

      // WhatsApp al cliente - Notificación de rechazo
      if (customerPhone) {
        const whatsappDeclined = `❌ *Pago Rechazado*

Hola, lamentamos informarte que el pago de tu orden *${reference}* por $${amount} COP no fue procesado.

📋 *Detalles:*
• *Referencia:* ${reference}
• *Monto:* $${amount} COP

🔄 *¿Qué puedes hacer?*
• Intenta nuevamente con otro método de pago
• Contáctanos al 314 393 0345 para ayudarte

_Estamos para servirte._`;

        await sendWhatsApp(customerPhone, whatsappDeclined);
      }

    } else if (status === 'PENDING') {
      await sendTelegram(
        `⏳ <b>PAGO PENDIENTE</b>\n\n` +
        `<b>Referencia:</b> ${reference}\n` +
        `<b>Monto:</b> $${amount} COP\n` +
        `<b>ID Wompi:</b> ${id}\n` +
        `<b>Teléfono:</b> ${customerPhone || 'No disponible'}\n\n` +
        `⏰ Esperando confirmación del pago.`
      );
    }

    return res.status(200).send('OK');

  } catch (error: any) {
    console.error('❌ Webhook Error:', error);
    return res.status(200).send('Error logged');
  }
}
