import type { VercelRequest, VercelResponse } from '@vercel/node';
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
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items' });
        }

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
        return res.status(500).json({ error: error.message });
    }
}
