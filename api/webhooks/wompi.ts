import { kv } from '@vercel/kv';
import { validateWompiSignature, copToCents, mapWompiStatus } from '../_utils/wompi';
import { getOrderByReference, updateOrderWithRetry } from '../_utils/woo';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const payload = req.body;
        const signature = req.headers['x-event-signature'] || req.headers['x-signature']; // Check both header variations

        // 1. Security: Validate Signature
        // Note: In Sandbox, Wompi might send different headers, verify payload structure
        // 1. Security: Validate Signature
        // Strict check ALWAYS (Sandbox sends valid signatures too)
        if (!validateWompiSignature(payload, signature)) {
            return res.status(401).send('Invalid Signature');
        }

        const { data, event, timestamp } = payload;
        const { transaction } = data;
        const eventId = transaction.id;
        const ref = transaction.reference; // Format: WC-{id}

        // 2. Atomic Idempotency (KV)
        // Try to set a lock key. If it exists (nx: true fails), we are already processing.
        const lockKey = `wompi:lock:${eventId}`;
        const processedKey = `wompi:processed:${eventId}`;

        // Check if fully processed already
        const isProcessed = await kv.get(processedKey);
        if (isProcessed) {
            return res.status(200).send('Already Processed');
        }

        // Acquire Lock
        const acquired = await kv.set(lockKey, '1', { nx: true, ex: 120 }); // 2 min lock
        if (!acquired) {
            return res.status(200).send('Processing in parallel');
        }

        // 3. Logic: Update Order
        try {
            const orderId = parseInt(ref.replace('WC-', ''));
            const order = await getOrderByReference(ref);

            if (!order) {
                console.error(`Order ${ref} not found`);
                // Release lock? No, keep it to prevent retries hammering
                return res.status(404).send('Order not found');
            }

            // Amount Validation
            const expectedCents = copToCents(order.total);
            const receivedCents = transaction.amount_in_cents;

            // Allow 1% variance for rounding issues? No, strict.
            if (expectedCents !== receivedCents) {
                throw new Error(`Amount mismatch: Expected ${expectedCents}, Got ${receivedCents}`);
            }

            // Update Status in WC
            const newStatus = mapWompiStatus(transaction.status);

            await updateOrderWithRetry(orderId, {
                status: newStatus,
                transaction_id: eventId,
                meta_data: [
                    { key: '_wompi_event_id', value: eventId },
                    { key: '_wompi_payment_method', value: transaction.payment_method_type }
                ]
            });

            // Mark as permanently processed
            await kv.set(processedKey, '1', { ex: 86400 * 30 }); // 30 days

            return res.status(200).send('Updated');

        } finally {
            // Always release the active lock
            await kv.del(lockKey);
        }

    } catch (error: any) {
        console.error('Webhook Error:', error);
        // Return 500 to trigger Wompi Retry? Or 200 to stop logic?
        // Standard: 500 triggers retry.
        return res.status(500).send(error.message);
    }
}
