import type { VercelRequest, VercelResponse } from '@vercel/node';
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

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

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
        return res.status(500).json({ error: error.message });
    }
}
