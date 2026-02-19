import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { updateOrder } from '../_utils/woo.js';

const WC_URL = process.env.VITE_WP_URL;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Secure Cron Execution
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // 2. Find Stale Orders
        // "pending" orders created > 30 mins ago
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

        const { data: pendingOrders } = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
            params: {
                status: 'pending',
                before: thirtyMinsAgo,
                per_page: 20 // Batch size
            },
            auth: { username: CK, password: CS }
        });

        if (!pendingOrders.length) {
            return res.status(200).json({ message: 'No stale orders found' });
        }

        const results = [];

        for (const order of pendingOrders) {
            const wompiTxId = order.meta_data.find((m: any) => m.key === '_wompi_event_id')?.value;
            const wompiRef = `WC-${order.id}`;

            // Check Wompi API
            // Note: We need a private key for this. 
            // Assuming WOMPI_PRIVATE_KEY is available in Vercel Env

            let status = 'UNKNOWN';

            try {
                const wompiRes = await axios.get(`https://production.wompi.co/v1/transactions`, {
                    params: { reference: wompiRef },
                    headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` }
                });

                const tx = wompiRes.data.data[0];
                status = tx ? tx.status : 'NOT_FOUND';

            } catch (err) {
                console.error(`Wompi API Error for ${wompiRef}:`, err);
                status = 'ERROR';
            }

            if (status === 'DECLINED' || status === 'VOIDED' || status === 'NOT_FOUND') {
                await updateOrder(order.id, { status: 'cancelled' });
                results.push({ id: order.id, action: 'cancelled', reason: status });
            } else if (status === 'APPROVED') {
                await updateOrder(order.id, { status: 'processing' });
                results.push({ id: order.id, action: 'recovered', reason: status });
            } else {
                results.push({ id: order.id, action: 'skipped', reason: status });
            }
        }

        return res.status(200).json({ processed: results.length, details: results });

    } catch (error: any) {
        console.error('Cron Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
