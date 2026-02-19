import type { VercelRequest, VercelResponse } from '@vercel/node';
<<<<<<< HEAD
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';

async function sendTelegram(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_USER_ID; // User ID is the chat ID for DM
    if (!token || !chatId) {
        console.warn('Telegram credentials missing');
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Telegram API Error:', err);
        }
    } catch (err) {
        console.error('Telegram Fetch Error:', err);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { items, customer } = req.body;
=======
import { corsHeaders, handleOptions, validateOrigin } from '../_utils/cors.js';
import { getProduct, createOrder } from '../_utils/woo.js';
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-signature');
        return res.status(204).end();
    }

    // Strict Origin Check (Log only for now to unblock prod)
    if (!validateOrigin(req)) {
        console.warn('⚠️ Origin Validation Failed but proceeding:', req.headers.origin || req.headers.Origin);
        // return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { items, customer } = req.body;
        console.log('📦 Create Order Request:', { items, customer: customer?.email });

>>>>>>> d9c7ce464f1b20607d52afd9393e22a7d1f8b77c
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

<<<<<<< HEAD
        // Calcular total desde el backend logic check (re-calculate to be safe, but trusting payload for now as per user req)
        // The user code snippet trusts `items` from body which contains `price`. 
        // In a real app we should validate price from DB, but here we follow user snippet.
        const calculatedTotal = items.reduce((acc: number, item: any) => {
            return acc + (parseFloat(item.price) * item.quantity);
        }, 0);

        // Generar ID de orden local
        const orderId = `FL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const amountInCents = copToCents(calculatedTotal); // copToCents handles string/number
        const currency = 'COP';
        const wompiReference = orderId;

        // Generate Signature
        const signature = generateIntegritySignature(wompiReference, amountInCents, currency);

        // Notificación Telegram
        const itemsList = items.map((i: any) =>
            `• ${i.name} x${i.quantity} = $${(i.price * i.quantity).toLocaleString()} COP`
        ).join('\n');

        await sendTelegram(
            `🛒 <b>NUEVA ORDEN</b> #${orderId}\n\n` +
            `<b>Cliente:</b> ${customer?.fullName || 'N/A'}\n` +
            `<b>Email:</b> ${customer?.email || 'N/A'}\n` +
            `<b>Tel:</b> ${customer?.phoneNumber || 'N/A'}\n` +
            `<b>Ciudad:</b> ${customer?.city || 'N/A'}\n\n` +
            `<b>Productos:</b>\n${itemsList}\n\n` +
            `<b>TOTAL: $${calculatedTotal.toLocaleString()} COP</b>`
        );

        return res.status(200).json({
            id: orderId,
            total: calculatedTotal.toString(),
            currency,
            reference: orderId, // Client expects 'reference' (key) but user snippet had 'key: orderId'. I'll send both to be safe.
            key: orderId,
            signature,
            amountInCents
        });

    } catch (error: any) {
        console.error('Order Error:', error);
=======
        // 1. Validate Prices & Calculate Total Server-Side
        let calculatedTotal = 0;
        const lineItems = [];

        for (const item of items) {
            const product = await getProduct(item.id);

            if (!product) {
                return res.status(404).json({ error: `Product ${item.id} not found` });
            }

            const price = parseFloat(product.price);
            const qty = item.quantity;

            calculatedTotal += price * qty;

            lineItems.push({
                product_id: item.id,
                quantity: qty
            });
        }

        // 2. Create Order in WooCommerce
        const orderData = {
            payment_method: 'wompi',
            payment_method_title: 'Wompi',
            set_paid: false,
            status: 'pending',
            billing: {
                first_name: customer.fullName,
                email: customer.email,
                phone: customer.phoneNumber,
                address_1: customer.address,
                city: customer.city,
                state: customer.department,
                country: 'CO'
            },
            shipping: {
                first_name: customer.fullName,
                address_1: customer.address,
                city: customer.city,
                state: customer.department,
                country: 'CO'
            },
            line_items: lineItems,
            meta_data: [
                { key: '_is_wompi_pending', value: 'yes' }
            ]
        };

        const order = await createOrder(orderData);

        // 3. Generate Wompi Integrity Signature
        const amountInCents = copToCents(order.total);
        const currency = order.currency || 'COP';
        const wompiReference = `WC-${order.id}`;

        const signature = generateIntegritySignature(wompiReference, amountInCents, currency);

        return res.status(200).json({
            id: order.id,
            total: order.total,
            currency: currency,
            key: order.order_key,
            signature // Return to frontend
        });

    } catch (error: any) {
        console.error('Order Creation Error:', error);
>>>>>>> d9c7ce464f1b20607d52afd9393e22a7d1f8b77c
        return res.status(500).json({ error: error.message });
    }
}
