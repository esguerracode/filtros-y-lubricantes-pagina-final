import { corsHeaders } from '../_utils/cors.js';
import { generateIntegritySignature, copToCents } from '../_utils/wompi.js';

export default async function handler(req: any, res: any) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(204).send();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, amount, reference, email, token, pseData, customerData, acceptance_token } = req.body;

    // Use Server Environment Variables
    const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
    const PUBLIC_KEY = process.env.VITE_WOMPI_PUBLIC_KEY; // Needed for acceptance token
    const INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || process.env.WOMPI_EVENTS_SECRET;

    if (!PRIVATE_KEY || !PUBLIC_KEY || !INTEGRITY_SECRET) {
        console.error('❌ Missing Wompi Environment Variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // 1. Obtener acceptance_token (Usar el del cliente si existe, sino buscarlo)
        let finalAcceptanceToken = acceptance_token;

        if (!finalAcceptanceToken) {
            console.log('⚠️ No acceptance_token provided by client, fetching from Wompi...');
            const merchantResponse = await fetch(`https://production.wompi.co/v1/merchants/${PUBLIC_KEY}`);
            const merchantData = await merchantResponse.json();

            if (!merchantData.data) {
                throw new Error('Valid Merchant Public Key required');
            }
            finalAcceptanceToken = merchantData.data.presigned_acceptance.acceptance_token;
        }

        // 2. Generar Firma de Integridad
        // Amount must be in CENTS (COP)
        // Example: 10000 COP -> 1000000 Cents
        const amountInCents = copToCents(amount);
        const currency = 'COP';

        // NOTE: verify usage of generateIntegritySignature in utils
        // It usually takes (reference, amountInCents, currency, secret)
        // ensure signature matches what Wompi expects

        // 3. Preparar el payload
        const payload: any = {
            acceptance_token: finalAcceptanceToken,
            amount_in_cents: amountInCents,
            currency: currency,
            customer_email: email,
            reference: reference,
            payment_method: {},
            customer_data: customerData || {
                phone_number: '+573000000000',
                full_name: 'Cliente Tienda'
            }
        };

        // Add signature if secret available
        if (INTEGRITY_SECRET) {
            const contentSignature = generateIntegritySignature(reference, amountInCents, currency);
            payload.signature = contentSignature;
        }

        if (type === 'CARD') {
            payload.payment_method = {
                type: 'CARD',
                token: token,
                installments: 1 // Default to 1 for now
            };
        } else if (type === 'PSE') {
            payload.payment_method = {
                type: 'PSE',
                user_type: parseInt(pseData.user_type),
                user_legal_id_type: pseData.user_legal_id_type,
                user_legal_id: pseData.user_legal_id,
                financial_institution_code: pseData.financial_institution_code,
                payment_description: pseData.payment_description || `Pago Ref: ${reference}`
            };
        }

        console.log('🚀 Sending Transaction to Wompi:', JSON.stringify(payload, null, 2));

        // 4. Enviar a Wompi
        const response = await fetch('https://production.wompi.co/v1/transactions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.error) {
            console.error('❌ Wompi Transaction Error:', result.error);
            return res.status(400).json({ success: false, error: result.error.messages?.[0]?.description || 'Error en Wompi', details: result.error });
        }

        return res.status(200).json({ success: true, data: result.data });

    } catch (error: any) {
        console.error('❌ Payment API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
