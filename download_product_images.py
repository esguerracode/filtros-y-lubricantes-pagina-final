#!/usr/bin/env python3
"""
Automated Product Image Downloader
Uses Google Custom Search API to find and download professional product images
"""

import json
import os
import requests
from pathlib import Path
import time
from typing import List, Dict, Optional
import hashlib

# ============================================================
# CONFIGURATION
# ============================================================

# TODO: Obtener estos valores de Google Cloud Console
GOOGLE_API_KEY = "AIzaSy8k82_BuH1uu6.Hlk69AyvaFH6jGg5cuU"  # ✅ API Key proporcionada
CUSTOM_SEARCH_ENGINE_ID = "YOUR_CSE_ID_HERE"  # https://programmablesearchengine.google.com/

# Directorio de salida para imágenes
OUTPUT_DIR = Path("public/images/products")
PRODUCTS_JSON = "products_with_search_terms.json"

# Configuración de búsqueda
IMAGE_SIZE = "large"  # small, medium, large, xlarge
IMAGE_TYPE = "photo"  # photo, face, clipart, lineart
SAFE_SEARCH = "off"
NUM_RESULTS_PER_PRODUCT = 3  # Descargar las mejores 3 imágenes por producto

# ============================================================
# GOOGLE CUSTOM SEARCH API CLIENT
# ============================================================

class GoogleImageSearcher:
    """Cliente para Google Custom Search API"""
    
    BASE_URL = "https://www.googleapis.com/customsearch/v1"
    
    def __init__(self, api_key: str, cx: str):
        self.api_key = api_key
        self.cx = cx
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def search_images(self, query: str, num_results: int = 3) -> List[Dict]:
        """
        Busca imágenes en Google usando Custom Search API
        
        Args:
            query: Término de búsqueda
            num_results: Número de resultados a obtener (máx 10 por request)
        
        Returns:
            Lista de diccionarios con información de imágenes
        """
        params = {
            'key': self.api_key,
            'cx': self.cx,
            'q': query,
            'searchType': 'image',
            'num': min(num_results, 10),
            'imgSize': IMAGE_SIZE,
            'imgType': IMAGE_TYPE,
            'safe': SAFE_SEARCH,
            'fileType': 'jpg,png',  # Solo JPG y PNG
        }
        
        try:
            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'items' not in data:
                print(f"⚠️  No se encontraron resultados para: {query}")
                return []
            
            results = []
            for item in data['items']:
                results.append({
                    'url': item['link'],
                    'title': item.get('title', ''),
                    'width': item.get('image', {}).get('width', 0),
                    'height': item.get('image', {}).get('height', 0),
                    'size': item.get('image', {}).get('byteSize', 0),
                    'thumbnail': item.get('image', {}).get('thumbnailLink', '')
                })
            
            return results
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Error en búsqueda para '{query}': {e}")
            return []
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            return []

# ============================================================
# IMAGE DOWNLOADER
# ============================================================

class ImageDownloader:
    """Descarga y guarda imágenes"""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def download_image(self, url: str, filename: str, max_size_mb: int = 5) -> Optional[Path]:
        """
        Descarga una imagen desde URL
        
        Args:
            url: URL de la imagen
            filename: Nombre del archivo de salida
            max_size_mb: Tamaño máximo en MB
        
        Returns:
            Path del archivo descargado o None si falla
        """
        try:
            response = self.session.get(url, timeout=15, stream=True)
            response.raise_for_status()
            
            # Verificar tipo de contenido
            content_type = response.headers.get('Content-Type', '')
            if 'image' not in content_type.lower():
                print(f"⚠️  URL no es una imagen: {url}")
                return None
            
            # Verificar tamaño
            content_length = response.headers.get('Content-Length')
            if content_length and int(content_length) > max_size_mb * 1024 * 1024:
                print(f"⚠️  Imagen muy grande (>{max_size_mb}MB): {url}")
                return None
            
            # Determinar extensión
            ext = '.jpg'
            if 'png' in content_type.lower():
                ext = '.png'
            elif 'webp' in content_type.lower():
                ext = '.webp'
            
            # Guardar imagen
            output_path = self.output_dir / f"{filename}{ext}"
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Verificar que se descargó correctamente
            if output_path.stat().st_size < 1024:  # Menos de 1KB
                print(f"⚠️  Archivo muy pequeño, probablemente corrupto")
                output_path.unlink()
                return None
            
            return output_path
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Error descargando {url}: {e}")
            return None
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            return None

# ============================================================
# MAIN ORCHESTRATOR
# ============================================================

class ProductImageFetcher:
    """Orquestador principal para obtener imágenes de productos"""
    
    def __init__(self, searcher: GoogleImageSearcher, downloader: ImageDownloader):
        self.searcher = searcher
        self.downloader = downloader
        self.downloaded_images = {}
    
    def process_product(self, product: Dict, num_images: int = 3) -> List[str]:
        """
        Procesa un producto: busca imágenes y las descarga
        
        Args:
            product: Diccionario con datos del producto
            num_images: Número de imágenes a descargar
        
        Returns:
            Lista de rutas de imágenes descargadas
        """
        product_id = product['id']
        product_name = product['name']
        search_terms = product.get('search_terms', [])
        
        print(f"\n{'='*60}")
        print(f"📦 Procesando: {product_name} (ID: {product_id})")
        print(f"{'='*60}")
        
        # Combinar términos de búsqueda
        query = ' '.join(search_terms) if search_terms else product_name
        query += " white background product"  # Forzar fondo blanco
        
        print(f"🔍 Búsqueda: {query}")
        
        # Buscar imágenes
        results = self.searcher.search_images(query, num_results=num_images * 2)
        
        if not results:
            print(f"⚠️  No se encontraron imágenes para {product_name}")
            return []
        
        print(f"✅ Encontradas {len(results)} imágenes")
        
        # Descargar imágenes
        downloaded = []
        for idx, result in enumerate(results[:num_images], 1):
            print(f"\n  [{idx}/{num_images}] Descargando desde: {result['url'][:60]}...")
            
            # Generar nombre único
            filename = f"{product_id:03d}_{idx}"
            
            output_path = self.downloader.download_image(result['url'], filename)
            
            if output_path:
                print(f"  ✅ Guardado: {output_path.name}")
                downloaded.append(str(output_path.relative_to(Path.cwd())))
            else:
                print(f"  ❌ Falló descarga")
            
            # Rate limiting (max 1 request/second)
            time.sleep(1.2)
        
        self.downloaded_images[product_id] = downloaded
        return downloaded
    
    def process_all_products(self, products_file: str) -> Dict:
        """
        Procesa todos los productos del archivo JSON
        
        Args:
            products_file: Ruta al archivo JSON con productos
        
        Returns:
            Diccionario con estadísticas de descarga
        """
        # Cargar productos
        with open(products_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"\n🚀 Iniciando descarga para {len(products)} productos")
        print(f"📁 Directorio de salida: {self.downloader.output_dir}")
        print(f"🔢 Imágenes por producto: {NUM_RESULTS_PER_PRODUCT}\n")
        
        stats = {
            'total_products': len(products),
            'processed': 0,
            'total_images': 0,
            'failed': 0
        }
        
        for product in products:
            try:
                images = self.process_product(product, NUM_RESULTS_PER_PRODUCT)
                stats['processed'] += 1
                stats['total_images'] += len(images)
                
                if not images:
                    stats['failed'] += 1
                
                # Rate limiting entre productos
                time.sleep(1)
            
            except Exception as e:
                print(f"\n❌ Error procesando producto {product.get('id')}: {e}")
                stats['failed'] += 1
        
        return stats
    
    def save_results(self, output_file: str = "download_results.json"):
        """Guarda resultados de descarga"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.downloaded_images, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Resultados guardados en: {output_file}")

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    """Función principal"""
    
    print("""
╔══════════════════════════════════════════════════════════╗
║  🎨 Descargador Automático de Imágenes de Productos     ║
║     Google Custom Search API                             ║
╚══════════════════════════════════════════════════════════╝
""")
    
    # Validar configuración
    if GOOGLE_API_KEY == "YOUR_API_KEY_HERE":
        print("❌ ERROR: Debes configurar GOOGLE_API_KEY en el script")
        print("➡️  Obtén tu API Key en: https://console.cloud.google.com/apis/credentials")
        return
    
    if CUSTOM_SEARCH_ENGINE_ID == "YOUR_CSE_ID_HERE":
        print("❌ ERROR: Debes configurar CUSTOM_SEARCH_ENGINE_ID en el script")
        print("➡️  Crea tu Custom Search Engine en: https://programmablesearchengine.google.com/")
        return
    
    # Verificar archivo de productos
    if not Path(PRODUCTS_JSON).exists():
        print(f"❌ ERROR: No se encontró {PRODUCTS_JSON}")
        return
    
    # Inicializar componentes
    searcher = GoogleImageSearcher(GOOGLE_API_KEY, CUSTOM_SEARCH_ENGINE_ID)
    downloader = ImageDownloader(OUTPUT_DIR)
    fetcher = ProductImageFetcher(searcher, downloader)
    
    # Procesar productos
    try:
        stats = fetcher.process_all_products(PRODUCTS_JSON)
        
        # Guardar resultados
        fetcher.save_results()
        
        # Mostrar resumen
        print(f"\n{'='*60}")
        print("📊 RESUMEN DE DESCARGA")
        print(f"{'='*60}")
        print(f"  Productos procesados: {stats['processed']}/{stats['total_products']}")
        print(f"  Imágenes descargadas: {stats['total_images']}")
        print(f"  Productos sin imágenes: {stats['failed']}")
        print(f"  Tasa de éxito: {(stats['processed']-stats['failed'])/stats['total_products']*100:.1f}%")
        print(f"{'='*60}\n")
        
        print("✅ Proceso completado")
        print(f"📁 Imágenes guardadas en: {OUTPUT_DIR}")
        print("\n➡️  Siguiente paso: Revisar imágenes y actualizar constants.ts")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Proceso interrumpido por el usuario")
        fetcher.save_results("download_results_partial.json")
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
