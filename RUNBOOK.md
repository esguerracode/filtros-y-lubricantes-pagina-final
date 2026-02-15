# 📖 Wompi Integration Runbook

Este documento describe los procedimientos operativos para gestionar, monitorear y solucionar problemas en la integración de pagos Wompi.

## 🚨 Contactos de Emergencia
- **Tech Lead**: [Tu Nombre/Contacto]
- **Soporte Wompi**: soporte@wompi.com | 01 8000 518 500
- **Hosting (Vercel)**: status.vercel.com

---

## 🔍 Monitoreo Diario

### 1. Verificar Estado de Webhooks
Acceder al Dashboard de Wompi -> Developers -> Webhooks.
- **Meta**: 100% de entregas exitosas (Status 200).
- **Acción si falla**: Revisar logs de Vercel.

### 2. Revisar Dead Letter Queue (DLQ)
Si un pago falla repetidamente, se registra en Redis (KV).
- **Comando**: `kv-cli lrange dlq:wompi 0 -1` (si tienes CLI) o revisar logs de Vercel para "Moved to DLQ".

---

## 🛠️ Procedimientos de Solución de Problemas (Troubleshooting)

### Caso 1: Webhook Fallido (Orden no actualizada)
**Síntoma**: El usuario pagó en Wompi (Aprobado), pero en WooCommerce la orden sigue "Pendiente de Pago".

**Pasos de Recuperación**:
1. **Obtener ID de Transacción**: Del comprobante del usuario o Dashboard Wompi (ej: `01-123456-789`).
2. **Simular Webhook Manualmente**:
   Usa el script de simulación con los datos reales:
   
   ```bash
   # Editar scripts/simulate_webhook.ts con:
   # id: "01-123456-789"
   # reference: "WC-1050" (Referencia de la orden)
   # amount_in_cents: 5000000 (Monto exacto en centavos)
   # status: "APPROVED"
   
   npx tsx scripts/simulate_webhook.ts
   ```
3. **Verificar**: Revisa que la orden cambió a "Procesando" en WooCommerce.

### Caso 2: Error "Invalid Signature"
**Síntoma**: Wompi reporta error 401 en los webhooks.

**Acción**:
1. Verificar que `WOMPI_EVENTS_SECRET` en Vercel coincida EXACTAMENTE con el "Eventos Secret" del Dashboard de Wompi (Ambiente Producción).
2. Si rotaste las claves, actualiza la variable en Vercel y redesepliega.

### Caso 3: Idempotencia Bloqueada ("Processing in parallel")
**Síntoma**: Logs muestran múltiples intentos fallidos por bloqueo.

**Acción**:
El bloqueo expira automáticamente en 2 minutos (`ex: 120`).
- Si persiste, borrar manualmente la clave en Redis: `DEL wompi:lock:{transaction_id}`.

---

## 🔄 Procedimiento de Rollback
Si la integración causa errores críticos en el checkout:

1. **Revertir en Vercel**:
   - Ir a Vercel Dashboard -> Deployments.
   - Seleccionar el deployment anterior estable.
   - Clic en "Redeploy" o "Promote to Production".

2. **Apagar Webhooks (Temporal)**:
   - En Dashboard Wompi, eliminar o desactivar la URL del webhook hasta solucionar el bug.
   - Las órdenes quedarán pendientes, pero se pueden conciliar manualmente.
