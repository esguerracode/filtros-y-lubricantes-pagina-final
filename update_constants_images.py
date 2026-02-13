#!/usr/bin/env python3
"""
Update constants.ts with downloaded product images
"""

import json
import os
from pathlib import Path
from typing import Dict, List

# ============================================================
# CONFIGURATION
# ============================================================

DOWNLOAD_RESULTS = "download_results.json"
CONSTANTS_FILE = "src/constants.ts"
IMAGES_DIR = "public/images/products"

# ============================================================
# CONSTANTS.TS UPDATER
# ============================================================

def load_download_results(results_file: str) -> Dict:
    """Carga resultados de descarga"""
    if not Path(results_file).exists():
        print(f"❌ No se encontró {results_file}")
        print("➡️  Ejecuta primero: python download_product_images.py")
        return {}
    
    with open(results_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_best_image_for_product(product_id: int, downloaded_images: Dict) -> str:
    """
    Obtiene la mejor imagen para un producto
    
    Args:
        product_id: ID del producto
        downloaded_images: Diccionario con imágenes descargadas
    
    Returns:
        Ruta relativa de la imagen o placeholder si no hay
    """
    product_images = downloaded_images.get(str(product_id), [])
    
    if not product_images:
        # Mantener placeholder si no hay imagen
        return f"https://picsum.photos/seed/product{product_id}/400/400"
    
    # Tomar la primera imagen (mejor resultado de Google)
    best_image = product_images[0]
    
    # Convertir a ruta relativa desde public/
    # "public/images/products/101_1.jpg" -> "/images/products/101_1.jpg"
    if best_image.startswith('public/'):
        best_image = best_image.replace('public/', '/')
    elif best_image.startswith('public\\'):
        best_image = best_image.replace('public\\', '/').replace('\\', '/')
    else:
        best_image = f"/images/products/{Path(best_image).name}"
    
    return best_image

def update_constants_ts(constants_file: str, downloaded_images: Dict):
    """
    Actualiza constants.ts con las rutas de imágenes descargadas
    
    Args:
        constants_file: Ruta al archivo constants.ts
        downloaded_images: Diccionario con imágenes descargadas
    """
    if not Path(constants_file).exists():
        print(f"❌ No se encontró {constants_file}")
        return
    
    # Leer archivo actual
    with open(constants_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Contador de actualizaciones
    updates = 0
    
    # Buscar y reemplazar imágenes para cada producto
    for product_id_str, images in downloaded_images.items():
        product_id = int(product_id_str)
        new_image = get_best_image_for_product(product_id, downloaded_images)
        
        # Buscar patrón: id: XXX, ... image: 'cualquier_cosa'
        import re
        
        # Patrón para encontrar el bloque del producto
        pattern = rf"(id:\s*{product_id}\s*,[\s\S]*?image:\s*['\"])([^'\"]+)(['\"])"
        
        def replacer(match):
            nonlocal updates
            old_image = match.group(2)
            if old_image != new_image:
                updates += 1
                print(f"  ✅ Producto {product_id}: {Path(new_image).name}")
            return match.group(1) + new_image + match.group(3)
        
        content = re.sub(pattern, replacer, content)
    
    # Guardar archivo actualizado
    if updates > 0:
        with open(constants_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n💾 Archivo actualizado: {constants_file}")
        print(f"📊 Total de imágenes actualizadas: {updates}")
    else:
        print("\n⚠️  No se encontraron productos para actualizar")

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    """Función principal"""
    
    print("""
╔══════════════════════════════════════════════════════════╗
║  🔄 Actualizador de constants.ts                         ║
║     Reemplaza placeholders con imágenes reales           ║
╚══════════════════════════════════════════════════════════╝
""")
    
    # Cargar resultados de descarga
    print("📂 Cargando resultados de descarga...")
    downloaded_images = load_download_results(DOWNLOAD_RESULTS)
    
    if not downloaded_images:
        print("\n❌ No hay imágenes descargadas")
        print("➡️  Ejecuta primero: python download_product_images.py")
        return
    
    print(f"✅ Encontradas imágenes para {len(downloaded_images)} productos\n")
    
    # Actualizar constants.ts
    print("🔄 Actualizando constants.ts...\n")
    update_constants_ts(CONSTANTS_FILE, downloaded_images)
    
    print("\n✅ Proceso completado")
    print("\n➡️  Siguiente paso:")
    print("   1. Revisar imágenes en public/images/products/")
    print("   2. Ejecutar: npm run dev")
    print("   3. Verificar productos en http://localhost:5173/products")

if __name__ == "__main__":
    main()
