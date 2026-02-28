# 🔧 GUÍA: Cambiar Nameservers a Vercel en HostGator

## ⚠️ **Situación Actual**

Tu dominio `filtrosylubricantes.co` actualmente apunta a **Cloudflare** (`lennon.ns.cloudflare.com` / `liberty.ns.cloudflare.com`), pero **NO tienes acceso a esa cuenta de Cloudflare**.

Esto bloquea completamente el acceso a las APIs de Vercel y, por tanto, al sistema de pagos Wompi.

## ✅ **Solución: Usar Nameservers de Vercel**

Al cambiar los nameservers a Vercel, **Vercel tendrá control total del dominio**, lo que significa:
- ✅ El sitio web funcionará correctamente
- ✅ Las APIs (`/api/*`) serán accesibles
- ✅ El sistema de pagos Wompi funcionará
- ✅ SSL automático
- ✅ Sin dependencias de terceros

---

## 📋 **Pasos Detallados (5 minutos)**

### **1. Ingresar al Portal de HostGator**

1. Ve a: [https://cliente.hostgator.co/](https://cliente.hostgator.co/)
2. Inicia sesión con tus credenciales
3. En el menú lateral, haz clic en **"Dominios"**

### **2. Localizar tu Dominio**

1. Busca `filtrosylubricantes.co` en la lista de dominios
2. Haz clic en **"Administrar"** o **"Configurar"**

### **3. Cambiar Nameservers**

1. Busca la sección llamada **"Servidores DNS"** o **"Nameservers"**
2. **IMPORTANTE**: Haz clic en el botón **"Configurar dominio"** (botón IZQUIERDO)
   - ⚠️ **NO** uses "Configurar con Gator" (botón derecho)
3. Selecciona la opción **"Nameservers Personalizados"** o **"Custom Nameservers"**
4. **Reemplaza** los nameservers actuales con estos valores:

```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

5. Haz clic en **"Guardar"** o **"Actualizar"**

### **4. Confirmar el Cambio**

Deberías ver un mensaje de confirmación tipo:
> "Los nameservers han sido actualizados exitosamente"

---

## ⏱️ **Tiempo de Propagación**

- **Mínimo**: 5-10 minutos
- **Promedio**: 1-2 horas  
- **Máximo**: 24-48 horas (raro)

---

## ✅ **Verificar que Funcionó**

Una vez que guardes los cambios, puedes verificar el estado con este comando en tu terminal (PowerShell):

```powershell
nslookup -type=NS filtrosylubricantes.co 8.8.8.8
```

**Resultado EXITOSO** (cuando propague):
```
nameserver = ns1.vercel-dns.com
nameserver = ns2.vercel-dns.com
```

**Resultado ANTIGUO** (todavía no ha propagado):
```
nameserver = lennon.ns.cloudflare.com
nameserver = liberty.ns.cloudflare.com
```

---

## 🚀 **Próximos Pasos (Después de la Propagación)**

Una vez que los nameservers propaguen a Vercel, automáticamente:
1. ✅ El sitio estará accesible en `www.filtrosylubricantes.co`
2. ✅ Las APIs de Vercel funcionarán (`/api/orders/create`, `/api/payments/create`)
3. ✅ El flujo completo de Wompi estará operativo
4. ✅ SSL se configurará automáticamente

Yo te ayudaré a **probar el flujo completo de pagos** tan pronto como el DNS propague.

---

## 📞 **¿Necesitas Ayuda?**

Si tienes problemas con el portal de HostGator:
1. Busca el botón específico que dice **"Nameservers"** o **"Servidores DNS"**
2. Toma una captura de pantalla de la pantalla de configuración
3. Puedo guiarte paso a paso con más detalle

---

## 🎯 **Resumen Rápido**

| Item | Valor |
|------|-------|
| **Nameserver 1** | `ns1.vercel-dns.com` |
| **Nameserver 2** | `ns2.vercel-dns.com` |
| **Servicio** | Vercel (NO Cloudflare, NO HostGator) |
| **Tipo** | Nameservers Personalizados |
| **Tiempo estimado** | 1-2 horas para propagación |

---

**¿Estás listo para hacer el cambio?** Una vez lo hagas, avísame para monitorear la propagación y probar el sistema de pagos.
