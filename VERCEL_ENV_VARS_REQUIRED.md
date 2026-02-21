# Vercel Environment Variables Required

Las siguientes variables deben estar configuradas en el dashboard de Vercel para el correcto funcionamiento del sitio:

| Variable | Descripción |
| :--- | :--- |
| `VITE_WOMPI_PUBLIC_KEY` | Clave pública Wompi (pub_prod_...) |
| `WOMPI_INTEGRITY_SECRET` | Secreto de integridad del dashboard Wompi |
| `WOMPI_EVENTS_SECRET` | Secreto de webhook del dashboard Wompi |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID numérico de Telegram |
| `RESEND_API_KEY` | API key de resend.com (gratis) |
