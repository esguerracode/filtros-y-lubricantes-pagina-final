import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { validateWompiSignature, copToCents, mapWompiStatus } from '../_utils/wompi.js';
import { getOrderByReference, updateOrderWithRetry } from '../_utils/woo.js';
import { sendTelegram } from '../_utils/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const payload = req.body;
        const signature = req.headers['x-event-signature'] || req.headers['x-signature'];

        // 1. Security: Validate Signature
        if (!validateWompiSignature(payload, signature)) {
            console.error('❌ Invalid Wompi Signature');
            return res.status(401).send('Invalid Signature');
        }

        const { data, timestamp } = payload;
        const { transaction } = data;
        const eventId = transaction.id;
        const ref = transaction.reference;

        console.log(`📩 Wompi Webhook Received: ${ref} | Status: ${transaction.status}`);

        // 2. Atomic Idempotency (KV)
        const lockKey = `wompi:lock:${eventId}`;
        const processedKey = `wompi:processed:${eventId}`;

        const isProcessed = await kv.get(processedKey);
        if (isProcessed) {
            return res.status(200).send('Already Processed');
        }

        const acquired = await kv.set(lockKey, '1', { nx: true, ex: 120 });
        if (!acquired) {
            return res.status(200).send('Processing in parallel');
        }

        // 3. Logic: Update Order
        try {
            // Handle both WC-ID and FL-ID references
            const isWooOrder = ref.startsWith('WC-');
            const orderId = isWooOrder ? parseInt(ref.replace('WC-', '')) : null;

            if (isWooOrder && orderId) {
                const order = await getOrderByReference(ref);
                if (order) {
                    const expectedCents = copToCents(order.total);
                    const receivedCents = transaction.amount_in_cents;

                    if (expectedCents === receivedCents) {
                        const newStatus = mapWompiStatus(transaction.status);
                        await updateOrderWithRetry(orderId, {
                            status: newStatus,
                            transaction_id: eventId,
                            customer_note: `Pago Wompi ${transaction.status}. ID: ${eventId}`
                        });
                        console.log(`✅ Order ${ref} updated to ${newStatus}`);
                    } else {
                        console.warn(`⚠️ Amount mismatch for ${ref}: Expected ${expectedCents}, Got ${receivedCents}`);
                    }
                }
            }

            // 4. Telegram Notification for Approval
            if (transaction.status === 'APPROVED') {
                const amountFormatted = (transaction.amount_in_cents / 100).toLocaleString('es-CO');
                await sendTelegram(
                    `✅ <b>PAGO APROBADO</b>\n\n` +
                    `<b>Orden:</b> ${ref}\n` +
                    `<b>Monto:</b> $${amountFormatted} COP\n` +
                    `<b>Método:</b> ${transaction.payment_method_type}\n` +
                    `<b>ID Wompi:</b> <code>${eventId}</code>\n\n` +
                    `El pedido ya puede ser procesado.`
                );
            } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
                await sendTelegram(
                    `❌ <b>PAGO RECHAZADO</b>\n\n` +
                    `<b>Orden:</b> ${ref}\n` +
                    `<b>Estado:</b> ${transaction.status}\n` +
                    `<b>ID Wompi:</b> ${eventId}`
                );
            }

            await kv.set(processedKey, '1', { ex: 86400 * 30 }); // 30 days
            return res.status(200).send('Processed');

        } finally {
            await kv.del(lockKey);
        }

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return res.status(500).send(error.message);
    }
}
