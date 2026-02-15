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

##  Dashboard de Monitoreo (Primeras 24h)

### Hora 0 (Post-Deploy)
- [ ] **Verificar Variables en Vercel**:
  - WOMPI_EVENTS_SECRET: Debe empezar con wh_prod_.
  - KV_URL: Configurada correctamente.
- [ ] **Verificar Webhook en Wompi**:
  - URL: https://filtrosylubricantes.co/api/webhooks/wompi`r
  - Estado: 'Active'.

### Hora 1
- [ ] **Wompi Dashboard**: Verificar que la transacción de prueba (Smoke Test) aparece como APPROVED.
- [ ] **Vercel Logs**: Filtrar por 'wompi' y buscar status 202 Accepted o 200 OK.

### Hora 24 (Reporte Diario)
- **Webhook delivery rate**: Objetivo >98%.
- **Errores signature**: Debe ser 0.
- **Entries en DLQ**: Debe ser 0.

---

##  Red Flags (Alertas Críticas)

###  Webhooks con status 401 (Invalid Signature)
**Causa**: WOMPI_EVENTS_SECRET incorrecto o ambiente mixto (Test vs Prod).
**Acción**: Rotar secret en Wompi y actualizar en Vercel inmediatamente.

###  Webhooks con status 500
**Causa**: Error interno o WooCommerce caído.
**Acción**: Revisar logs de Vercel. Si es timeout de WooCommerce, el sistema reintentará automáticamente.

###  Órdenes 'Pending Payment' > 30 min
**Causa**: Webhook no llegó o falló silenciosamente.
**Acción**: Usar script manual (scripts/simulate_webhook.ts).

---

##  Configuración de Dominio (Vercel)

Para apuntar iltrosylubricantes.co a producción:

1. **Vercel**: Settings -> Domains -> Add iltrosylubricantes.co.
   - Copiar registros A y CNAME proporcionados.
2. **Registrar (HostGator/GoDaddy)**:
   - Eliminar registros A/CNAME antiguos.
   - Agregar nuevo Registro A (@) -> IP de Vercel (ej: 76.76.21.21).
   - Agregar nuevo CNAME (www) -> cname.vercel-dns.com.
3. **Verificación**: Usar [DNSChecker](https://dnschecker.org) para confirmar propagación.
