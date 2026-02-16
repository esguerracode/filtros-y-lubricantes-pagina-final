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

const CACHE_KEY = 'wc_products_cache_v9';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Mapeo manual de priorización para asegurar que las fotos reales se vean
// incluso si WooCommerce trae placeholders.
const LOCAL_IMAGE_OVERRIDE: Record<string, string> = {
  // TOYOTA REVO
  'KIT TOYOTA REVO (Pack Completo)': '/images/products/101_toyota_revo_kit_1771121527793.png',
  'Filtro Aire AIP 977 (Toyota Revo)': '/images/products/air_filter_toyota_revo_aip977_1771121653543.png',
  'Filtro Cabina ACP 138 (Toyota Revo)': '/images/products/112_cabin_filter_acp138_1771121716440.png',

  // TOYOTA VIGO
  'KIT TOYOTA VIGO (Pack Completo)': '/images/products/kit_toyota_revo_pack_completo_1771121609322.png', // Usando imagen de alta calidad compatible

  // NISSAN NP300
  'KIT NISSAN NP 300 GASOLINA (Pack)': '/images/products/nissan_np300_filter_kit_1771121830345.png',
  'KIT NISSAN NP 300 DIESEL (Pack)': '/images/products/nissan_np300_filter_kit_1771121830345.png',

  // FORD RANGER - CORREGIDO (Imágenes HD)
  'KIT FORD RANGER FILTROS NACIONALES (Pack)': '/images/products/ford_ranger_air_filter_2025_1771119732254.png',
  'KIT FORD RANGER ORIGINAL 2022-2024 (Pack)': '/images/products/ford_ranger_air_filter_mb3z19n619c_1771119793659.png',
  'KIT FORD RANGER ORIGINAL 2025-2026 (Pack)': '/images/products/ford_ranger_air_filter_2025_1771119920235.png',

  // ACEITES MOTORCRAFT - CORREGIDO (Imágenes HD y Distintas)
  'Aceite Motorcraft 10W30 (1/4 Galón)': '/images/products/motorcraft_oil_5w30_1_4_galon_1771119745300.png', // Imagen correcta cuartos
  'Aceite Motorcraft 5W30 (1/4 Galón)': '/images/products/clean_motorcraft_5w30_quart_1771120280601.png',

  // MOBIL DELVAC
  'Mobil Delvac 15W40 Galón': '/images/products/mobil_delvac_15w40_gallon_1771121799090.png',
  'Aceite Mobil 10W30 (1/4 Galón)': '/images/products/121.png', // Mantener si es correcta, verificar después

  // FILTROS INDIVIDUALES (Mapeo inteligente con HD)
  'Filtro Aire Motor MB3Z-9601C (Ford Original 2025)': '/images/products/ford_air_filter_mb3z19n619c_1771119889411.png',
  'Filtro Aire Acondicionado MB3Z19N619C (Ford Original 2025)': '/images/products/ford_cabin_filter_professional_1771120211306.png',
  'Filtro Combustible FLP 509 (Ford Ranger)': '/images/products/ford_ranger_air_filter_mb3z19n619c_1771119700526.png', // Mejor aproximación HD disponible
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
