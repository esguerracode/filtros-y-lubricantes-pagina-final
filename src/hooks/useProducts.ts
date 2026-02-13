import { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product as LocalProduct, Category } from '../types';

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string | null;
  images: { src: string; alt: string }[];
  stock_status: string;
  description?: string;
  categories?: any[];
}

const CACHE_KEY = 'wc_products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const mapWCToLocal = (wcProducts: Product[]): LocalProduct[] => {
  return wcProducts.map(p => {
    let priceNumeric = parseFloat(p.price) || parseFloat(p.regular_price) || 0;

    // Normalización: Si el precio es menor a 1000, asumimos que está en USD y convertimos a COP (Tasa aprox 4000)
    // El usuario solicitó ajustar esto directamente aquí.
    if (priceNumeric > 0 && priceNumeric < 1000) {
      priceNumeric = priceNumeric * 4000;
    }

    return {
      id: p.id,
      name: p.name,
      price: priceNumeric,
      category: mapCategory(p.categories),
      description: p.description || '',
      image: p.images?.[0]?.src || '/placeholder.jpg'
    };
  });
};

const mapCategory = (categories: any[]): Category => {
  if (!categories || categories.length === 0) return Category.LUBRICANTES;
  const catName = categories[0].name?.toLowerCase() || '';
  if (catName.includes('lubricante')) return Category.LUBRICANTES;
  if (catName.includes('filtro')) return Category.FILTROS;
  if (catName.includes('batería') || catName.includes('bateria')) return Category.BATERIAS;
  if (catName.includes('llanta')) return Category.LLANTAS;
  return Category.LUBRICANTES;
};

export const useProducts = () => {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      // 1. Intentar cargar desde caché
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Productos cargados desde caché');
            setProducts(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Caché inválido, limpiando...');
        localStorage.removeItem(CACHE_KEY);
      }

      // 2. Fetch desde WooCommerce con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const url = `${import.meta.env.VITE_WP_URL}/wp-json/wc/v3/products`;
        const key = import.meta.env.VITE_WC_CONSUMER_KEY;
        const secret = import.meta.env.VITE_WC_CONSUMER_SECRET;

        if (!key || !secret) {
          throw new Error('Faltan claves API en .env.local');
        }

        const response = await fetch(
          `${url}?consumer_key=${key}&consumer_secret=${secret}&per_page=100`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Respuesta no JSON recibida (${contentType}). Posible error de servidor o redirección.`);
        }

        const data: Product[] = await response.json();
        const mappedProducts = mapWCToLocal(data);

        // Guardar en caché
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: mappedProducts,
          timestamp: Date.now()
        }));

        console.log(`✅ ${mappedProducts.length} productos cargados desde WooCommerce`);
        setProducts(mappedProducts);
        setLoading(false);
      } catch (err: any) {
        clearTimeout(timeoutId);

        // 3. Fallback a datos hardcoded
        console.warn('⚠️ WooCommerce no disponible, usando datos locales');
        console.error('Error:', err.message);

        setProducts(PRODUCTS);
        setError('Mostrando catálogo local (WooCommerce temporalmente no disponible)');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
