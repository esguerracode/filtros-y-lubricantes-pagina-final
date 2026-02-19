export function cors(req: Request, res: Response, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Lock verify strictly in PROD if able
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-signature'
};

export function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export function validateOrigin(req: any): boolean {
    const origin = req.headers.origin || req.headers.Origin;
    const allowed = [
        process.env.VITE_APP_URL,
        'http://localhost:5173', // Localhost
        'https://filtrosylubricantes.co', // Production
        'https://www.filtrosylubricantes.co',
        'https://esguerracode-filtros-y-lubricantes-pagina-final.vercel.app'
    ];

    // Server-to-server or no-origin (e.g. Postman) might need specific handling, 
    // but for Frontend-to-Backend, origin is required.
    if (!origin) return false;

    return allowed.some(domain => domain && origin.startsWith(domain));
}
