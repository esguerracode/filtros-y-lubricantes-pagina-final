import type { VercelRequest, VercelResponse } from '@vercel/node';

// Diccionario de códigos DANE base para las ciudades principales
const DANE_CODES: Record<string, string> = {
    'BOGOTA': '11001',
    'MEDELLIN': '05001',
    'CALI': '76001',
    'BARRANQUILLA': '08001',
    'CARTAGENA': '13001',
    'CUCUTA': '54001',
    'BUCARAMANGA': '68001',
    'PEREIRA': '66001',
    'SANTA MARTA': '47001',
    'IBAGUE': '73001',
    'PASTO': '52001',
    'MANIZALES': '17001',
    'NEIVA': '41001',
    'VILLAVICENCIO': '50001',
    'ARMENIA': '86001',
    'POPAYAN': '19001',
    'SINCELEJO': '70001',
    'TUNJA': '15001',
    'RIOHACHA': '44001',
    'PUERTO GAITAN': '50568',
    'ACACIAS': '50006',
    'GRANADA': '50313'
};

const ORIGIN_DANE = '50568'; // Puerto Gaitan, Meta

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { city, items } = req.body;

        if (!city || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Missing city or items' });
        }

        // Calcula un peso estimado: 1kg por item (ajusta esto según tus productos)
        const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
        let estimatedWeight = totalItems * 1; // kg
        if (estimatedWeight < 1) estimatedWeight = 1; // Minimo 1kg

        // Valor declarado (Suma total)
        const declaredValue = items.reduce((acc, item) => acc + (parseFloat(item.price) * (Number(item.quantity) || 1)), 0);

        // Normalize city string for search
        const cleanCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        let destinationDane = '';

        for (const [key, code] of Object.entries(DANE_CODES)) {
            if (cleanCity.includes(key)) {
                destinationDane = code;
                break;
            }
        }

        const apiKey = process.env.MIPAQUETE_API_KEY;

        // Si no hay DANE mapeado o no hay API_KEY, hacemos un fallback seguro (Tarifa fija / Moch)
        if (!destinationDane || !apiKey) {
            console.warn(`Fallback triggered: DANE=${destinationDane}, API_KEY_EXISTS=${!!apiKey}`);
            // Simulamos un retraso de API
            await new Promise(resolve => setTimeout(resolve, 800));

            // Tarifa plana local vs nacional
            const isLocal = cleanCity.includes('PUERTO GAITAN') || cleanCity.includes('VILLAVICENCIO') || cleanCity.includes('META');
            const calculatedCost = isLocal ? 10000 : 18000;

            return res.status(200).json({
                success: true,
                cost: calculatedCost,
                carrier: !apiKey ? "Logística Local (Esperando API Key MiPaquete)" : "TCC / Servientrega (Tarifa Plana Nacional)",
                estimatedDays: isLocal ? "1 a 2 días hábiles" : "3 a 5 días hábiles",
                isFallback: true
            });
        }

        // --- LLAMADA REAL A MIPAQUETE ---
        // (Asegurate de usar la URL de produccion de mipaquete cuando pases a prod)
        const mipaqueteUrl = 'https://api-v2.dev.mpr.mipaquete.com/quoteShipping';

        const payload = {
            "originLocationCode": ORIGIN_DANE,
            "destinyLocationCode": destinationDane,
            "quantity": 1,
            "width": 20, // dimensiones promedio de la caja
            "length": 20,
            "height": 20,
            "weight": estimatedWeight,
            "declaredValue": declaredValue
        };

        const response = await fetch(mipaqueteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
                'session-tracker': 'esguerracode-checkout'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`MiPaquete API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Mipaquete suele retornar un arreglo de cotizaciones con diferentes transportadoras
        // Buscamos la mas barata
        if (data && Array.isArray(data) && data.length > 0) {
            data.sort((a, b) => a.totalValue - b.totalValue);
            const bestQuote = data[0];

            return res.status(200).json({
                success: true,
                cost: bestQuote.totalValue,
                carrier: bestQuote.deliveryCompany || "Transportadora",
                estimatedDays: bestQuote.deliveryTime || "2 a 4 días",
                isFallback: false
            });
        }

        // Si por alguna razon la API no devuelve cotizaciones, fallback final
        return res.status(200).json({
            success: true,
            cost: 15000,
            carrier: "Transportadora Nacional",
            estimatedDays: "3 a 5 días hábiles",
            isFallback: true
        });

    } catch (error: any) {
        console.error('Shipping quote error:', error);
        // Regresar un fallback en caso de caida 500 de Mipaquete para no trancar la venta
        return res.status(200).json({
            success: true,
            cost: 15000,
            carrier: "Logística Estandar",
            estimatedDays: "3 a 5 días hábiles",
            isFallback: true
        });
    }
}
