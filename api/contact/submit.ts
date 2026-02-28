import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTelegram } from '../_utils/telegram.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Allow only POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { nombre, telefono, email, mensaje } = req.body;

        // Basic validation
        if (!nombre || !telefono || !mensaje) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Construct the Telegram message
        const telegramMessage = `
📬 <b>NUEVO CONTACTO WEB</b>

👤 <b>Nombre:</b> ${nombre}
📱 <b>Teléfono:</b> ${telefono}
📧 <b>Email:</b> ${email || 'No proporcionado'}

💬 <b>Mensaje:</b>
${mensaje}

<i>_Enviado desde el formulario de contacto_</i>
    `.trim();

        // Send the message using the shared utility
        await sendTelegram(telegramMessage);

        // Return success response
        return res.status(200).json({ success: true, message: 'Contact form submitted successfully' });

    } catch (error: any) {
        console.error('Contact submission error:', error);
        return res.status(500).json({ error: 'Internal server error while processing contact form' });
    }
}
