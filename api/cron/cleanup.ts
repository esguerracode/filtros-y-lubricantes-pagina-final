/**
 * Cron Job: Health Check
 * Antes limpiaba pedidos pendientes de WooCommerce.
 * WooCommerce fue eliminado — este endpoint es un ping de salud.
 * Schedule: diario a medianoche (ver vercel.json)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar que la llamada viene del cron de Vercel
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  console.log('✅ Cron health check OK:', new Date().toISOString());

  return res.status(200).json({
    ok: true,
    message: 'Sistema operativo. Sin tareas pendientes.',
    timestamp: new Date().toISOString()
  });
}
