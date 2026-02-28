# 🔑 Configuración Google Custom Search API

## Paso 1: Obtener API Key

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Click en **"Create Credentials"** → **"API Key"**
4. Copia la API Key generada
5. *(Opcional)* Click en el ícono de editar y restringe la API Key:
   - Application restrictions: None
   - API restrictions: Custom Search API

**✅ Ya tienes la API habilitada** (según tu captura de pantalla)

---

## Paso 2: Crear Custom Search Engine

1. Ve a [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click en **"Add"** o **"Get Started"**
3. Configuración:
   - **Name**: `Filtros Lubricantes Image Search`
   - **What to search**: `Search the entire web`
   - **Image search**: `ON` (IMPORTANTE)
   - **SafeSearch**: `OFF` (opcional)
4. Click **"Create"**
5. En la página de confirmación, click en **"Control Panel"**
6. En "Setup" → "Basics", copia el **Search engine ID** (cx)
   - Se ve algo así: `a1b2c3d4e5f6g7h8i`

---

## Paso 3: Configurar el Script

Abre `download_product_images.py` y reemplaza:

```python
# Líneas 18-19
GOOGLE_API_KEY = "TU_API_KEY_AQUI"  # Pegado del Paso 1
CUSTOM_SEARCH_ENGINE_ID = "TU_CSE_ID_AQUI"  # Pegado del Paso 2
```

---

## Paso 4: Instalar Dependencia

```bash
pip install requests
```

---

## Paso 5: Ejecutar

```bash
python download_product_images.py
```

---

## 📊 Límites de la API Gratuita

- **100 búsquedas/día** (gratis)
- Con 33 productos × 3 imágenes = ~33 búsquedas
- ✅ **Suficiente** para este proyecto

Si necesitas más:
- **$5 USD** = 1,000 búsquedas adicionales

---

## ⚠️ Troubleshooting

### Error: "API key not valid"
- Verifica que copiaste la API Key completa
- Asegúrate de haber habilitado "Custom Search API" en tu proyecto

### Error: "Invalid Value cx"
- El Search Engine ID debe venir del Control Panel de Programmable Search
- No confundir con otros IDs del proyecto

### No se encuentran imágenes
- El script añade `"white background product"` automáticamente
- Si aún así falla, edita manualmente los `search_terms` en `products_with_search_terms.json`

---

## 🎯 Resultado Esperado

```
📦 Procesando: KIT TOYOTA REVO (ID: 101)
🔍 Búsqueda: toyota revo filter kit white background product
✅ Encontradas 10 imágenes
  [1/3] Descargando...
  ✅ Guardado: 101_1.jpg
  [2/3] Descargando...
  ✅ Guardado: 101_2.jpg
  [3/3] Descargando...
  ✅ Guardado: 101_3.jpg
```

Imágenes guardadas en: `public/images/products/`
