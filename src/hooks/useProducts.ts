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

const CACHE_KEY = 'wc_products_cache_v7';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Mapeo manual de priorización para asegurar que las fotos reales se vean
// incluso si WooCommerce trae placeholders.
const LOCAL_IMAGE_OVERRIDE: Record<string, string> = {
  'KIT TOYOTA REVO (Pack Completo)': '/images/products/101.png',
  'Filtro Aire AIP 977 (Toyota Revo)': '/images/products/111.png',
  'Filtro Cabina ACP 138 (Toyota Revo)': '/images/products/112.png',
  'Filtro Aceite OLP 067 (Toyota Revo)': '/images/products/113.png',
  'Filtro Combustible FLP 476 (Toyota Revo)': '/images/products/114.png',
  'Mobil Delvac 15W40 Galón': '/images/products/102.png',
  'KIT TOYOTA VIGO (Pack Completo)': '/images/products/103.png',
  'Filtro Aire AIP 651 (Toyota Vigo)': '/images/products/115.png',
  'Filtro Cabina ACP 071 (Toyota Vigo)': '/images/products/116.png',
  'Filtro Combustible FLP 355 (Toyota Vigo)': '/images/products/117.png',
  'KIT NISSAN NP 300 GASOLINA (Pack)': '/images/products/104.png',
  'Filtro Aire AIP 961 (Nissan NP300)': '/images/products/118.png',
  'Filtro Cabina ACP 123 (Nissan NP300)': '/images/products/119.png',
  'Filtro Aceite OLP 019 (Nissan NP300)': '/images/products/120.png',
  'Aceite Mobil 10W30 Galón': '/images/products/105.png',
  'Aceite Mobil 10W30 (1/4 Galón)': '/images/products/121.png',
  'KIT NISSAN NP 300 DIESEL (Pack)': '/images/products/106.png',
  'Filtro Aceite OLP 077 (Nissan NP300 Diesel)': '/images/products/122.png',
  'Filtro Combustible FLP 472 (Nissan NP300 Diesel)': '/images/products/123.png',
  'KIT FORD RANGER FILTROS NACIONALES (Pack)': '/images/products/107.png',
  'Filtro Aceite OLP 115 (Ford Ranger)': '/images/products/124.png',
  'Filtro Combustible FLP 509 (Ford Ranger)': '/images/products/125.png',
  'Aceite Motorcraft 10W30 (1/4 Galón)': '/images/products/126.png',
  'KIT FORD RANGER ORIGINAL 2022-2024 (Pack)': '/images/products/108.png',
  'Filtro Combustible EB3Z-9365B (Ford Original)': '/images/products/127.png',
  'Filtro Aire Motor MG2MZ9601B (Ford Original)': '/images/products/128.png',
  'Filtro Aceite JU2Z-6731A (Ford Original)': '/images/products/129.png',
  'Filtro Aire Acondicionado HB3Z19N619B (Ford Original)': '/images/products/130.png',
  'KIT FORD RANGER ORIGINAL 2025-2026 (Pack)': '/images/products/109.png',
  'Filtro Combustible KV61-9155AG (Ford Original 2025)': '/images/products/131.png',
  'Filtro Aire Motor MB3Z-9601C (Ford Original 2025)': '/images/products/132.png',
  'Filtro Aire Acondicionado MB3Z19N619C (Ford Original 2025)': '/images/products/133.png',
  'Aceite Motorcraft 5W30 (1/4 Galón)': '/images/products/110.png'
};

const getLocalImageFallback = (name: string): string | null => {
  const normalizedName = name.toLowerCase();

  // 1. Coincidencia exacta (idempotencia)
  if (LOCAL_IMAGE_OVERRIDE[name]) return LOCAL_IMAGE_OVERRIDE[name];

  // 2. Coincidencia parcial inteligente (keywords)
  // Si el nombre de WooCommerce contiene palabras clave únicas de nuestros productos
  for (const [key, path] of Object.entries(LOCAL_IMAGE_OVERRIDE)) {
    const keyParts = key.toLowerCase().split(' ');
    // Si el nombre contiene referencias específicas como "AIP 977" o "OLP 067"
    const specializedPart = keyParts.find(p => /^[A-Z]{2,3}\s*[0-9]{2,4}$/.test(p) || /^[A-Z0-9-]{5,}$/.test(p));

    if (specializedPart && normalizedName.includes(specializedPart.toLowerCase())) {
      return path;
    }

    // Si el nombre de WooCommerce es básicamente el mismo pero sin "(Pack Completo)" etc.
    if (normalizedName.includes(key.toLowerCase().replace(/\(.*\)/, '').trim())) {
      return path;
    }
  }
  return null;
};

const mapWCToLocal = (wcProducts: Product[]): LocalProduct[] => {
  return wcProducts.map(p => {
    let priceNumeric = parseFloat(p.price) || parseFloat(p.regular_price) || 0;

    if (priceNumeric > 0 && priceNumeric < 1000) {
      priceNumeric = priceNumeric * 4000;
    }

    const localImage = getLocalImageFallback(p.name);

    return {
      id: p.id,
      name: p.name,
      price: priceNumeric,
      category: mapCategory(p.categories),
      description: p.description || '',
      // Priorizar imagen local encontrada por lógica inteligente, sino usar la de WC
      image: localImage || p.images?.[0]?.src || '/placeholder.jpg'
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
        console.warn('⚠️ WooCommerce no disponible o error, usando datos locales');

        // CORRECCIÓN CRÍTICA: Asegurar que los productos locales tengan sus imágenes sincronizadas
        const productsWithFixedImages = PRODUCTS.map(p => ({
          ...p,
          image: getLocalImageFallback(p.name) || p.image
        }));

        setProducts(productsWithFixedImages);
        setError('Mostrando catálogo local');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
