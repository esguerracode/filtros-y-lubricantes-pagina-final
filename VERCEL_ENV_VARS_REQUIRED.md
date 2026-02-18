# 🔑 Variables de Entorno Requeridas en Vercel

## Cómo agregarlas
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto `esguerracode-filtros-y-lubricantes-pagina-final`
3. Settings → Environment Variables
4. Agregar cada variable para **Production** (y opcionalmente Preview/Development)

---

## Variables EXISTENTES (ya configuradas) ✅
| Variable | Descripción |
|----------|-------------|
| `VITE_WOMPI_PUBLIC_KEY` | `pub_prod_N3wRyFLmr5kSWrRZa4nTS07CctnJnJ2w` |
| `VITE_WOMPI_REDIRECT_URL` | `https://filtrosylubricantes.co/success` |
| `VITE_WOMPI_TEST` | `false` |
| `VITE_WP_URL` | `https://filtrosylubricantes.co` |
| `WC_CONSUMER_KEY` | `ck_94239f46265fa5783236a3071ba498c243b6abe9` |
| `WC_CONSUMER_SECRET` | `cs_737a842a7726787831bc1886b95ea80815ff7a2b` |
| `WOMPI_EVENTS_SECRET` | `prod_events_Oe7M3uaEG8GQUVWD5AOcYDGnoUwvZzij` |
| `KV_REST_API_*` | Variables de Vercel KV (Upstash Redis) |

## Variables FALTANTES (AGREGAR INMEDIATAMENTE) ❌

### 1. `WOMPI_PRIVATE_KEY`
- **Formato**: `prv_prod_XXXXXXXXXXXXXXXXXXXXXX`
- **Dónde encontrarla**: https://comercios.wompi.co → Perfil → Llaves de API → Llave privada de producción
- **Requerida para**: Crear transacciones en Wompi (tarjetas y PSE)

### 2. `WOMPI_INTEGRITY_SECRET`
- **Formato**: `prod_integrity_XXXXXXXXXXXXXXXXXXXXXX`
- **Dónde encontrarla**: https://comercios.wompi.co → Perfil → Llaves de API → Secreto de integridad
- **Requerida para**: Generar firma de integridad para validar transacciones

---

## Verificación
Una vez agregadas, dispara un re-deploy en Vercel (o haz un push vacío) y prueba:

```bash
# Desde la consola del navegador en filtrosylubricantes.co:
fetch('/api/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'CARD', amount: 1000, reference: 'TEST-1', email: 'test@test.com' })
}).then(r => r.json()).then(console.log)
```

**Resultado esperado**: Un error de Wompi sobre token faltante (NO un error de "keys missing")
