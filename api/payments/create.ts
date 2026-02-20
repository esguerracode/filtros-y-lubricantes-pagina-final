/**
 * DEPRECATED — Este endpoint usaba la API privada de Wompi directamente.
 * El flujo actual usa el Widget de Wompi via /api/orders/create.
 * Mantenido para evitar 404 en código legado.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({
    error: 'Endpoint deprecado.',
    message: 'Usa el flujo del Widget Wompi vía POST /api/orders/create'
  });
}
