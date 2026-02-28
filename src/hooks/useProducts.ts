/**
 * useProducts Hook
 * Carga el catálogo de productos LOCALMENTE desde constants.ts.
 * WooCommerce eliminado - ya no es necesario.
 */
import { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product, Category } from '../types';

// Mapeo de imágenes HD para productos
const LOCAL_IMAGE_OVERRIDE: Record<string, string> = {};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usar siempre el catálogo local - limpio, rápido, sin dependencias externas
    const localProducts = PRODUCTS.map(p => ({
      ...p,
      image: LOCAL_IMAGE_OVERRIDE[p.name] || p.image
    }));

    setProducts(localProducts);
    setLoading(false);
    console.log(`✅ Catálogo local cargado: ${localProducts.length} productos`);
  }, []);

  return { products, loading, error: null };
};
