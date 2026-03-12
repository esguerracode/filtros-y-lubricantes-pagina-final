import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTelegram } from '../_utils/telegram.js';
import { sendWhatsApp } from '../_utils/whatsapp.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { nombre, telefono, email, mensaje } = req.body;

        if (!nombre || !telefono || !mensaje) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const clientWhatsApp = process.env.CLIENT_WHATSAPP || '573143930345';

        // Mensaje para Telegram (al administrador)
        const telegramMessage = `
📬 <b>NUEVO CONTACTO WEB</b>

👤 <b>Nombre:</b> ${nombre}
📱 <b>Teléfono:</b> ${telefono}
📧 <b>Email:</b> ${email || 'No proporcionado'}

💬 <b>Mensaje:</b>
${mensaje}

<i>_Enviado desde el formulario de contacto_</i>
        `.trim();

        // Mensaje para WhatsApp del cliente
        const whatsappClientMessage = `¡Hola ${nombre}! 👋

Gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo te responderá en menos de 15 minutos.

📝 *Resumen de tu consulta:*
${mensaje}

🕐 *Horario de atención:*
Lunes a Viernes: 7:00 AM - 6:00 PM
Sábados: 7:00 AM - 2:00 PM

_Este es un mensaje automático de Filtros y Lubricantes del Llano._`;

        // Enviar a Telegram (ya existe)
        await sendTelegram(telegramMessage);

        // Enviar confirmación por WhatsApp al cliente
        await sendWhatsApp(telefono, whatsappClientMessage);

        return res.status(200).json({ success: true, message: 'Contact form submitted successfully' });

    } catch (error: any) {
        console.error('Contact submission error:', error);
        return res.status(500).json({ error: 'Internal server error while processing contact form' });
    }
}
