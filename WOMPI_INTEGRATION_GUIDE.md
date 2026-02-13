# 🚀 Guía de Integración Wompi - Filtros y Lubricantes

## 📋 Índice
1. [Ventajas de Wompi](#ventajas-de-wompi)
2. [Registro y Obtención de Credenciales](#registro-y-obtención-de-credenciales)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Modo Sandbox (Pruebas)](#modo-sandbox-pruebas)
5. [Paso a Producción](#paso-a-producción)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Ventajas de Wompi

| Aspecto | Wompi | PayU |
|---------|-------|------|
| **Comisión** | 2.65% + $700 COP | 3.29% + $300 COP |
| **Registro** | 1-3 días | 3-5 días |
| **Documentos** | RUT + Cuenta Bancaria | Múltiples documentos legales |
| **Sandbox** | Acceso inmediato | Requiere aprobación |
| **Widget** | Integrado (pop-up) | Solo redirección |
| **Métodos de pago** | Tarjetas, PSE, Nequi, Bancolombia | Tarjetas, PSE básico |

**Wompi es ideal si:**
- ✅ Quieres empezar a probar **HOY MISMO**
- ✅ Tienes cuenta Bancolombia o Nequi
- ✅ Quieres menores comisiones
- ✅ Prefieres un widget moderno sin salir de tu página

---

## 🔐 Registro y Obtención de Credenciales

### Paso 1: Crear Cuenta en Wompi

1. **Ir a [comercios.wompi.co](https://comercios.wompi.co)**
2. Clic en **"Crea tu cuenta"**
3. Seleccionar tipo de cuenta:
   - **Empresarial**: Si tienes empresa registrada (requiere RUT + Cámara de Comercio)
   - **Independiente (Persona Natural)**: Si eres emprendedor individual (solo RUT)

### Paso 2: Completar Registro

#### Para Persona Natural:
```
Documentos necesarios:
✅ Cédula de ciudadanía
✅ RUT actualizado
✅ Cuenta bancaria Bancolombia o Nequi (antigüedad >30 días)
```

#### Para Persona Jurídica (Empresa):
```
Documentos necesarios:
✅ Cámara de Comercio digitalizada (menor a 30 días)
✅ RUT de la empresa
✅ Cédula del representante legal
✅ Cuenta bancaria empresarial Bancolombia
```

### Paso 3: Verificación

1. **Ingresar datos personales/empresariales**
   - Nombre/Razón social
   - Correo electrónico
   - Teléfono
   - Dirección

2. **Verificar correo electrónico**
   - Recibirás un código de verificación

3. **Elegir plan**
   - **Plan Avanzado** (recomendado): 2.65% + $700 + IVA

4. **Configurar cuenta bancaria**
   - Banco: Bancolombia o Nequi
   - Tipo: Ahorros o Corriente
   - ⚠️ Debe estar a nombre del titular del registro

5. **Firma digital del contrato**
   - Recibirás un enlace por correo

6. **Esperar aprobación**
   - ⏱️ 1-3 días hábiles
   - Recibirás confirmación por correo

---

## 🛠️ Configuración del Proyecto

### Paso 1: Obtener Claves API

Una vez aprobada tu cuenta:

1. **Ir al Dashboard de Wompi**: [comercios.wompi.co](https://comercios.wompi.co)
2. **Menú lateral** → **"Development"** (Desarrollo) → **"Developers"**
3. **Activar Modo Sandbox** (para pruebas)
4. **Copiar tus claves:**

```
🔑 Clave Pública Sandbox:  pub_test_XXXXXXXXXXXX
🔐 Clave Privada Sandbox:  prv_test_XXXXXXXXXXXX
```

### Paso 2: Configurar .env.local

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Wompi Payment Gateway Configuration
VITE_WOMPI_PUBLIC_KEY=pub_test_TU_CLAVE_PUBLICA_AQUI
VITE_WOMPI_PRIVATE_KEY=prv_test_TU_CLAVE_PRIVADA_AQUI
VITE_WOMPI_TEST=true
VITE_WOMPI_REDIRECT_URL=http://localhost:5173/success
```

⚠️ **IMPORTANTE**:
- NO subas `.env.local` a GitHub (ya está en `.gitignore`)
- Las claves sandbox tienen prefijo `pub_test_` y `prv_test_`
- Las claves de producción tienen prefijo `pub_prod_` y `prv_prod_`

### Paso 3: Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl+C)
# Reiniciar:
npm run dev
```

---

## 🧪 Modo Sandbox (Pruebas)

### Tarjetas de Prueba

Wompi proporciona tarjetas de prueba para simular pagos:

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| **Visa Aprobada** | `4242 4242 4242 4242` | ✅ APROBADA |
| **Visa Declinada** | `4111 1111 1111 1111` | ❌ DECLINADA |

**Datos adicionales** (para cualquier tarjeta de prueba):
- **Fecha vencimiento**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Nombre**: Cualquier nombre

### Probar el Checkout

1. **Inicia el servidor**: `npm run dev`
2. **Navega a la tienda**: `http://localhost:5173`
3. **Agrega productos al carrito**
4. **Ir a Checkout**
5. **Llenar datos de envío**
6. **Clic en "Finalizar Pedido"**
7. **Se abre el Widget de Wompi** (pop-up)
8. **Ingresar tarjeta de prueba** (4242 4242 4242 4242)
9. **Completar pago**
10. **Serás redirigido a `/success`**

### Verificar Transacciones

1. **Dashboard Wompi** → **Transacciones**
2. Verás todas las transacciones de prueba
3. Estado: `APPROVED`, `DECLINED`, `PENDING`

---

## 🌐 Paso a Producción

Una vez que hayas probado en Sandbox y estés listo para pagos reales:

### 1. Obtener Claves de Producción

1. **Dashboard Wompi** → **Desactivar Modo Sandbox**
2. **Development** → **Developers**
3. **Copiar claves de producción:**

```
🔑 Clave Pública Producción:  pub_prod_XXXXXXXXXXXX
🔐 Clave Privada Producción:  prv_prod_XXXXXXXXXXXX
```

### 2. Actualizar .env.local

```bash
# Wompi Production Configuration
VITE_WOMPI_PUBLIC_KEY=pub_prod_TU_CLAVE_PRODUCCION_AQUI
VITE_WOMPI_PRIVATE_KEY=prv_prod_TU_CLAVE_PRODUCCION_AQUI
VITE_WOMPI_TEST=false  # ⚠️ CAMBIAR A false
VITE_WOMPI_REDIRECT_URL=https://filtrosylubricantes.co/success
```

### 3. Desplegar a Producción

```bash
# Construir versión de producción
npm run build

# Subir la carpeta dist/ a tu servidor
```

### 4. Webhooks (Opcional pero Recomendado)

Los webhooks te permiten recibir confirmaciones asíncronas de pagos:

1. **Dashboard Wompi** → **Developers** → **Webhooks**
2. **Agregar URL**: `https://filtrosylubricantes.co/wompi-webhook.php`
3. **Eventos a escuchar:**
   - `transaction.updated`
   - `payment_source.deleted`

---

## 🔧 Troubleshooting

### Widget no se abre

**Síntoma**: Clic en "Finalizar Pedido" pero no pasa nada

**Solución**:
```bash
# 1. Verificar claves en .env.local
# 2. Reiniciar servidor
npm run dev

# 3. Revisar consola del navegador (F12)
# Busca errores de Wompi
```

### Error: "Invalid Public Key"

**Causa**: Clave pública incorrecta o ambiente incorrecto

**Solución**:
- Verifica que la clave empiece con `pub_test_` (sandbox) o `pub_prod_` (producción)
- Asegúrate de que `VITE_WOMPI_TEST` coincida con el tipo de clave

### Pago no se registra

**Causa**: No se está redirigiendo correctamente después del pago

**Solución**:
```tsx
// Verificar que VITE_WOMPI_REDIRECT_URL sea correcta
// En desarrollo:
VITE_WOMPI_REDIRECT_URL=http://localhost:5173/success

// En producción:
VITE_WOMPI_REDIRECT_URL=https://filtrosylubricantes.co/success
```

### Variables de entorno no se cargan

**Causa**: Vite no detecta cambios en `.env.local`

**Solución**:
```bash
# 1. Detener el servidor (Ctrl+C)
# 2. Reiniciar
npm run dev
```

---

## 📊 Comparación Final: Wompi vs PayU

```
WOMPI ✅
✓ Comisión más baja: 2.65%
✓ Aprobación rápida: 1-3 días
✓ Sandbox inmediato
✓ Widget moderno (sin redirección)
✓ Menos documentos requeridos
✓ Integración con Bancolombia/Nequi

PAYU ❌
✗ Comisión más alta: 3.29%
✗ Aprobación lenta: 3-5 días
✗ Sandbox requiere aprobación
✗ Solo redirección (no widget)
✗ Más documentos legales
✗ Integración básica
```

---

## 📞 Soporte Wompi

- **Email**: soporte@wompi.com
- **Teléfono**: 01 8000 518 500
- **Chat**: Dashboard Wompi (esquina inferior derecha)
- **Documentación**: [docs.wompi.co](https://docs.wompi.co)

---

## ✅ Checklist de Integración

- [ ] Crear cuenta en Wompi
- [ ] Completar verificación de identidad
- [ ] Obtener claves de Sandbox
- [ ] Configurar `.env.local` con claves
- [ ] Probar checkout en `localhost`
- [ ] Validar transacciones en Dashboard Wompi
- [ ] Obtener claves de Producción
- [ ] Actualizar `.env.local` para producción
- [ ] Desplegar a servidor
- [ ] Configurar Webhooks (opcional)
- [ ] ¡Listo para recibir pagos! 🎉

---

**💡 Recomendación Final**: Empieza con el Sandbox para familiarizarte con el flujo. Una vez que todo funcione correctamente, migra a producción en menos de 5 minutos cambiando las claves.
