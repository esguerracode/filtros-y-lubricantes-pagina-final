/**
 * useProducts Hook
 * Carga el catálogo de productos LOCALMENTE desde constants.ts.
 * WooCommerce eliminado - ya no es necesario.
 */
import { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product, Category } from '../types';

// Mapeo de imágenes HD para productos
const LOCAL_IMAGE_OVERRIDE: Record<string, string> = {
  'KIT TOYOTA REVO (Pack Completo)': '/images/products/101_toyota_revo_kit_1771121527793.png',
  'Filtro Aire AIP 977 (Toyota Revo)': '/images/products/air_filter_toyota_revo_aip977_1771121653543.png',
  'Filtro Cabina ACP 138 (Toyota Revo)': '/images/products/112_cabin_filter_acp138_1771121716440.png',
  'KIT TOYOTA VIGO (Pack Completo)': '/images/products/kit_toyota_revo_pack_completo_1771121609322.png',
  'KIT NISSAN NP 300 GASOLINA (Pack)': '/images/products/nissan_np300_filter_kit_1771121830345.png',
  'KIT NISSAN NP 300 DIESEL (Pack)': '/images/products/nissan_np300_filter_kit_1771121830345.png',
  'KIT FORD RANGER FILTROS NACIONALES (Pack)': '/images/products/ford_ranger_air_filter_2025_1771119732254.png',
  'KIT FORD RANGER ORIGINAL 2022-2024 (Pack)': '/images/products/ford_ranger_air_filter_mb3z19n619c_1771119793659.png',
  'KIT FORD RANGER ORIGINAL 2025-2026 (Pack)': '/images/products/ford_ranger_air_filter_2025_1771119920235.png',
  'Aceite Motorcraft 10W30 (1/4 Galón)': '/images/products/motorcraft_oil_5w30_1_4_galon_1771119745300.png',
  'Aceite Motorcraft 5W30 (1/4 Galón)': '/images/products/clean_motorcraft_5w30_quart_1771120280601.png',
  'Mobil Delvac 15W40 Galón': '/images/products/mobil_delvac_15w40_gallon_1771121799090.png',
  'Filtro Aire Motor MB3Z-9601C (Ford Original 2025)': '/images/products/ford_air_filter_mb3z19n619c_1771119889411.png',
  'Filtro Aire Acondicionado MB3Z19N619C (Ford Original 2025)': '/images/products/ford_cabin_filter_professional_1771120211306.png',
  'Filtro Combustible FLP 509 (Ford Ranger)': '/images/products/ford_ranger_air_filter_mb3z19n619c_1771119700526.png',
};

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
