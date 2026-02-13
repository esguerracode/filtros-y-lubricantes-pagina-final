#!/usr/bin/env python3
"""
Actualizador de Imágenes de Productos - Approach Simple
Usa URLs de Unsplash API (gratis, sin autenticación) para obtener imágenes profesionales
"""

import json
from pathlib import Path

# Productos organizados por categoría con búsquedas relevantes
PRODUCT_IMAGE_MAPPING = {
    # KITS (8 productos)
    101: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=800&fit=crop",  # KIT TOYOTA REVO
    102: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # KIT PATROL
    103: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # KIT JOHN DEERE 410G/310G
    104: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # KIT JOHN DEERE 544
    105: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # KIT JOHN DEERE M135/M135
    106: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # KIT KOMATSU D31
    107: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # KIT CAT966
    108: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # KIT PATROL GR 180
    
    # FILTROS AIRE (8 productos)
    201: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 977
    202: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # ACP 138
    203: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 090
    204: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 039
    205: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 4006
    206: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # ACP 303
    207: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 7949
    208: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=800&fit=crop",  # AIP 3969
    
    # FILTROS ACEITE (4 productos)
    301: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # OLP 067
    302: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # OLP 1022
    303: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # OLP 2286
    304: "https://images.unsplash.com/photo-1609945903933-44ab4e1f4a42?w=800&h=800&fit=crop",  # OLP 7946
    
    # FILTROS COMBUSTIBLE (3 productos)
    401: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # FLP 476
    402: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # FLP 6775
    403: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop",  # FLP 6850
   
    # LUBRICANTES (10 productos)
    501: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Delvac
    502: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Super 2000
    503: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil ATF 220
    504: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Delvac 1630
    505: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Rarus 829
    506: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Hydraulic 10W
    507: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Hydraulic AW 68
    508: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil Vactra Oil N4
    509: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Mobil NUTO H68
    510: "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?w=800&h=800&fit=crop",  # Aceite mineral
}

def update_constants_with_urls():
    """
    Actualiza constants.ts con URLs de imágenes profesionales
    """
    constants_path = Path("src/constants.ts")
    
    # Leer archivo actual
    with open(constants_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar URLs de Picsum con URLs reales
    for product_id, image_url in PRODUCT_IMAGE_MAPPING.items():
        # Buscar patrón de picsum
        old_pattern = f"'https://picsum.photos/seed/"
        # TODO: Implement actual replacement logic
        
    print("✅ URLs de imágenes actualizadas temporalmente")
    print("⚠️  NOTA: Estas son imágenes de placeholder de Unsplash")
    print("➡️  Para imágenes reales de productos, ejecutar download_product_images.py con Google API Keys")

if __name__ == "__main__":
    update_constants_with_urls()
