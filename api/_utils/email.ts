// ============================================================
// BREVO transactional email — zero npm deps, pure fetch
// ENV: BREVO_API_KEY, BREVO_FROM_EMAIL
// ============================================================

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  reference,
  transactionId,
  amount,
  items,
  whatsapp = '3143930345'
}: {
  to: string;
  customerName: string;
  reference: string;
  transactionId: string;
  amount: string;
  items: { name: string; quantity: number; price: number }[];
  whatsapp?: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'ventas@filtrosylubricantes.co';

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not set');
    return { error: 'BREVO_API_KEY not configured' };
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">
        $${item.price.toLocaleString('es-CO')}
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">

    <!-- HEADER -->
    <div style="background:#1a3a5c;padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">Filtros y Lubricantes del Llano</h1>
      <p style="color:#a0c4e8;margin:8px 0 0">Confirmación de tu pedido</p>
    </div>

    <!-- HERO -->
    <div style="background:#f0fdf4;padding:24px;text-align:center;border-bottom:2px solid #22c55e">
      <div style="font-size:48px">✅</div>
      <h2 style="color:#16a34a;margin:8px 0">¡Pago Exitoso!</h2>
      <p style="color:#555;margin:0">Hola <strong>${customerName}</strong>, tu pedido ha sido confirmado.</p>
    </div>

    <!-- DETALLES -->
    <div style="padding:24px">
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase">Referencia del pedido</p>
        <p style="margin:0;font-size:20px;font-weight:bold;color:#1a3a5c">${reference}</p>
        <p style="margin:4px 0 0;color:#888;font-size:12px">ID Transacción: ${transactionId}</p>
      </div>

      <!-- PRODUCTOS -->
      <h3 style="color:#1a3a5c;margin:0 0 12px">Productos pedidos</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e0e0e0;color:#888;font-size:12px">PRODUCTO</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e0e0e0;color:#888;font-size:12px">CANT.</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e0e0e0;color:#888;font-size:12px">PRECIO</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0;font-weight:bold;color:#1a3a5c">TOTAL</td>
            <td style="padding:12px 0;font-weight:bold;font-size:18px;color:#1a3a5c;text-align:right">
              $${amount} COP
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- ENVIO -->
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:24px 0">
        <p style="margin:0;color:#92400e;font-size:14px">
          📦 <strong>Envío coordinado</strong> — Nos contactaremos contigo para coordinar la entrega.
        </p>
      </div>

      <!-- WHATSAPP -->
      <div style="text-align:center;margin:24px 0">
        <p style="color:#555;margin:0 0 12px">¿Tienes preguntas sobre tu pedido?</p>
        <a href="https://wa.me/57${whatsapp.replace(/\s/g, '')}"
          style="background:#25D366;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
          💬 Escríbenos por WhatsApp
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e0e0e0">
      <p style="margin:0;color:#888;font-size:12px">
        Filtros y Lubricantes del Llano S.A.S.<br>
        Villavicencio, Meta — Colombia<br>
        <a href="https://filtrosylubricantes.co" style="color:#1a3a5c">filtrosylubricantes.co</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const payload = {
    sender: { name: 'Filtros y Lubricantes', email: fromEmail },
    to: [{ email: to, name: customerName }],
    subject: `✅ Pedido confirmado ${reference} — Filtros y Lubricantes`,
    htmlContent: html
  };

  const response = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${error}`);
  }

  return await response.json();
}
