# 🚀 Guía de Uso - Descarga Automática de Imágenes

Este sistema automatiza completamente la descarga de imágenes profesionales para los 33 productos.

---

## 📋 Proceso Completo (3 Pasos)

### **Paso 1: Configurar Google API** ⏱️ 5-10 minutos

Sigue la guía en [`GOOGLE_API_SETUP.md`](./GOOGLE_API_SETUP.md):

1. Obtener API Key de Google Cloud
2. Crear Custom Search Engine
3. Editar `download_product_images.py` con tus credenciales

```python
# Líneas 18-19 del archivo download_product_images.py
GOOGLE_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"
CUSTOM_SEARCH_ENGINE_ID = "a1b2c3d4e5f6g7h8i"
```

---

### **Paso 2: Descargar Imágenes** ⏱️ 5-10 minutos

```bash
# Instalar dependencia
pip install requests

# Ejecutar descargador
python download_product_images.py
```

**Salida esperada:**
```
📦 Procesando: KIT TOYOTA REVO (ID: 101)
🔍 Búsqueda: toyota revo filter kit white background product
✅ Encontradas 10 imágenes
  [1/3] Descargando...
  ✅ Guardado: 101_1.jpg
  ...

📊 RESUMEN:
  Productos procesados: 33/33
  Imágenes descargadas: 99
  Tasa de éxito: 100%
```

**Resultado:**
- Imágenes guardadas en `public/images/products/`
- Archivo `download_results.json` con rutas

---

### **Paso 3: Actualizar constants.ts** ⏱️ 30 segundos

```bash
python update_constants_images.py
```

**Salida esperada:**
```
✅ Producto 101: 101_1.jpg
✅ Producto 102: 102_1.jpg
✅ Producto 103: 103_1.jpg
...
💾 Archivo actualizado: src/constants.ts
📊 Total de imágenes actualizadas: 33
```

---

## 🎯 Verificación

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:5173/products y verifica que:
- ✅ Se muestran las imágenes reales
- ✅ Las imágenes tienen fondo blanco/profesional
- ✅ No hay placeholders de Picsum

---

## ⚙️ Configuración Avanzada

### Cambiar número de imágenes por producto

Edita `download_product_images.py`:

```python
# Línea 24
NUM_RESULTS_PER_PRODUCT = 5  # Descarga 5 imágenes en lugar de 3
```

### Forzar búsquedas específicas

Si algún producto tiene resultados pobres, edita `products_with_search_terms.json`:

```json
{
  "id": 101,
  "search_terms": [
    "toyota revo 17801-0L040 air filter",  // Código de parte específico
    "sakura air filter toyota"             // Marca específica
  ]
}
```

Luego ejecuta nuevamente `download_product_images.py` (solo descargará los que falten).

### Tamaño de imagen

Edita `download_product_images.py`:

```python
# Línea 22
IMAGE_SIZE = "xlarge"  # small, medium, large, xlarge
```

---

## 🔍 Troubleshooting

### Problema: Imágenes con logos o texto

**Solución:** Añade filtros negativos a los search terms:

```json
{
  "search_terms": [
    "oil filter -logo -text -watermark"
  ]
}
```

### Problema: Límite de 100 búsquedas excedido

**Opciones:**
1. Esperar 24 horas (se resetea)
2. Pagar $5 USD por 1,000 búsquedas adicionales
3. Usar otra cuenta de Google Cloud

### Problema: Algunas imágenes no se descargaron

Revisa `download_results.json` para ver qué productos no tienen imágenes:

```bash
python -c "import json; r=json.load(open('download_results.json')); print([k for k,v in r.items() if not v])"
```

Vuelve a ejecutar el script (solo descargará los faltantes).

---

## 📊 Estructura de Archivos

```
Filtros-lubricantes-pagina-final/
├── download_product_images.py      # Script descargador
├── update_constants_images.py      # Script actualizador
├── GOOGLE_API_SETUP.md            # Guía de configuración API
├── IMAGE_DOWNLOAD_GUIDE.md        # Esta guía
├── products_with_search_terms.json # Productos y términos
├── download_results.json          # Resultados (generado)
│
├── public/
│   └── images/
│       └── products/              # Imágenes descargadas
│           ├── 101_1.jpg
│           ├── 101_2.jpg
│           ├── 101_3.jpg
│           └── ...
│
└── src/
    └── constants.ts               # Actualizado automáticamente
```

---

## ✅ Checklist

- [ ] API Key obtenida
- [ ] Custom Search Engine creado
- [ ] `download_product_images.py` configurado
- [ ] `pip install requests` ejecutado
- [ ] `python download_product_images.py` ejecutado exitosamente
- [ ] `python update_constants_images.py` ejecutado
- [ ] Imágenes verificadas en `/products`
- [ ] Imágenes aprobadas para producción

---

## 💡 Tip: Revisión Manual

Después de descargar, revisa las imágenes:

```bash
# Abrir carpeta de imágenes
start public/images/products  # Windows
# o
open public/images/products   # Mac/Linux
```

Si alguna imagen no es adecuada:
1. Elimínala de la carpeta
2. Ejecuta nuevamente el script (descargará la siguiente mejor opción)
3. O búscala manualmente y nómbrala `{product_id}_1.jpg`

---

**¿Necesitas ayuda?** Consulta `GOOGLE_API_SETUP.md` para configuración de API.
