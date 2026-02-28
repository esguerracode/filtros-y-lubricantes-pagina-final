
import { Category, Product } from './types';

export const CONTACT_INFO = {
  name: 'FILTROS Y LUBRICANTES DEL LLANO SAS',
  nit: '900.895.729-5',
  phone: '+57 314 393 03 45',
  whatsapp: '3143930345',
  location: 'Carrera 10 #15 - 03, Puerto Gaitán, Meta',
  email: 'filtrosylubricantesdelllano@gmail.com',
  instagram: 'filtrosylubricantesdel_llano',
  officialLink: 'https://api.whatsapp.com/send?phone=573143930345',
  bio: 'Expertos en filtros y lubricantes para maquinaria agrícola e industrial, transporte pesado y todo tipo de vehículos. 🚜🚚'
};

export const BRANDS = ['Mobil', 'ACE', 'Bridgestone', 'Duncan', 'John Deere', 'Mac', 'Valvoline', 'Varta'];

export const PRODUCTS: Product[] = [

  // ============================================================
  // 1. FILTROS DE ACEITE (OLP)
  // ============================================================
  {
    id: 113,
    name: 'Filtro Aceite OLP 067 (Toyota Revo / Vigo)',
    price: 15000,
    category: Category.FILTROS_ACEITE,
    description: 'Filtro de aceite OLP 067 compatible con Toyota Revo y Toyota Vigo.',
    image: '/images/products/113.png'
  },
  {
    id: 120,
    name: 'Filtro Aceite OLP 019 (Nissan NP300 Gasolina)',
    price: 15000,
    category: Category.FILTROS_ACEITE,
    description: 'Filtro de aceite OLP 019 para Nissan NP 300 Motor Gasolina.',
    image: '/images/products/120.png'
  },
  {
    id: 122,
    name: 'Filtro Aceite OLP 077 (Nissan NP300 Diesel)',
    price: 25000,
    category: Category.FILTROS_ACEITE,
    description: 'Filtro de aceite OLP 077 para Nissan NP 300 Motor Diesel.',
    image: '/images/products/122.png'
  },
  {
    id: 124,
    name: 'Filtro Aceite OLP 115 (Ford Ranger)',
    price: 25000,
    category: Category.FILTROS_ACEITE,
    description: 'Filtro de aceite OLP 115 para Ford Ranger (filtros nacionales).',
    image: '/images/products/124.png'
  },
  {
    id: 129,
    name: 'Filtro Aceite JU2Z-6731A (Ford Ranger Original)',
    price: 60000,
    category: Category.FILTROS_ACEITE,
    description: 'Filtro de aceite original Ford JU2Z-6731A para Ford Ranger 2022-2026.',
    image: '/images/products/129.png'
  },

  // ============================================================
  // 2. FILTROS DE AIRE MOTOR (AIP)
  // ============================================================
  {
    id: 111,
    name: 'Filtro Aire Motor AIP 977 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS_AIRE_MOTOR,
    description: 'Filtro de aire motor AIP 977 para Toyota Revo.',
    image: '/images/products/111.png'
  },
  {
    id: 115,
    name: 'Filtro Aire Motor AIP 651 (Toyota Vigo)',
    price: 50000,
    category: Category.FILTROS_AIRE_MOTOR,
    description: 'Filtro de aire motor AIP 651 para Toyota Vigo.',
    image: '/images/products/115.png'
  },
  {
    id: 118,
    name: 'Filtro Aire Motor AIP 961 (Nissan NP300)',
    price: 40000,
    category: Category.FILTROS_AIRE_MOTOR,
    description: 'Filtro de aire motor AIP 961 para Nissan NP 300 (Gasolina y Diesel).',
    image: '/images/products/118.png'
  },
  {
    id: 128,
    name: 'Filtro Aire Motor MG2MZ9601B (Ford Ranger Original 2022-2024)',
    price: 185000,
    category: Category.FILTROS_AIRE_MOTOR,
    description: 'Filtro de aire motor original Ford MG2MZ9601B para Ranger 2022-2024.',
    image: '/images/products/128.png'
  },
  {
    id: 132,
    name: 'Filtro Aire Motor MB3Z-9601C (Ford Ranger Original 2025-2026)',
    price: 210000,
    category: Category.FILTROS_AIRE_MOTOR,
    description: 'Filtro de aire motor original Ford MB3Z-9601C para Ranger 2025-2026.',
    image: '/images/products/132.png'
  },

  // ============================================================
  // 3. FILTROS DE AIRE ACONDICIONADO / CABINA (ACP)
  // ============================================================
  {
    id: 112,
    name: 'Filtro Cabina ACP 138 (Toyota Revo)',
    price: 35000,
    category: Category.FILTROS_AIRE_AC,
    description: 'Filtro de aire acondicionado/cabina ACP 138 para Toyota Revo.',
    image: '/images/products/112.png'
  },
  {
    id: 116,
    name: 'Filtro Cabina ACP 071 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS_AIRE_AC,
    description: 'Filtro de aire acondicionado/cabina ACP 071 para Toyota Vigo.',
    image: '/images/products/116.png'
  },
  {
    id: 119,
    name: 'Filtro Cabina ACP 123 (Nissan NP300)',
    price: 35000,
    category: Category.FILTROS_AIRE_AC,
    description: 'Filtro de aire acondicionado/cabina ACP 123 para Nissan NP 300 (Gasolina y Diesel).',
    image: '/images/products/119.png'
  },
  {
    id: 130,
    name: 'Filtro Cabina HB3Z19N619B (Ford Ranger Original 2022-2024)',
    price: 60000,
    category: Category.FILTROS_AIRE_AC,
    description: 'Filtro de aire acondicionado original Ford HB3Z19N619B para Ranger 2022-2024.',
    image: '/images/products/130.png'
  },
  {
    id: 133,
    name: 'Filtro Cabina MB3Z19N619C (Ford Ranger Original 2025-2026)',
    price: 110000,
    category: Category.FILTROS_AIRE_AC,
    description: 'Filtro de aire acondicionado original Ford MB3Z19N619C para Ranger 2025-2026.',
    image: '/images/products/133.png'
  },

  // ============================================================
  // 4. FILTROS DE COMBUSTIBLE (FLP)
  // ============================================================
  {
    id: 114,
    name: 'Filtro Combustible FLP 476 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible FLP 476 para Toyota Revo.',
    image: '/images/products/114.png'
  },
  {
    id: 117,
    name: 'Filtro Combustible FLP 355 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible FLP 355 para Toyota Vigo.',
    image: '/images/products/117.png'
  },
  {
    id: 123,
    name: 'Filtro Combustible FLP 471 (Nissan NP300 Diesel)',
    price: 65000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible FLP 471 para Nissan NP 300 Diesel.',
    image: '/images/products/123.png'
  },
  {
    id: 125,
    name: 'Filtro Combustible FLP 509 (Ford Ranger)',
    price: 100000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible FLP 509 para Ford Ranger (filtros nacionales).',
    image: '/images/products/125.png'
  },
  {
    id: 127,
    name: 'Filtro Combustible EB3Z-9365B (Ford Ranger Original 2022-2024)',
    price: 300000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible original Ford EB3Z-9365B para Ranger 2022-2024.',
    image: '/images/products/127.png'
  },
  {
    id: 131,
    name: 'Filtro Combustible KV61-9155AG (Ford Ranger Original 2025-2026)',
    price: 600000,
    category: Category.FILTROS_COMBUSTIBLE,
    description: 'Filtro de combustible original Ford KV61-9155AG para Ranger 2025-2026.',
    image: '/images/products/131.png'
  },

  // ============================================================
  // 5. LUBRICANTES (Aceites — Galones y Cuartos)
  // ============================================================
  {
    id: 102,
    name: 'Mobil Delvac 15W40 — Galón',
    price: 125000,
    category: Category.LUBRICANTES,
    description: 'Aceite Mobil Delvac MX 15W-40 para motores diesel de servicio pesado. Presentación: Galón.',
    image: '/images/products/102.png'
  },
  {
    id: 105,
    name: 'Aceite Mobil 10W30 — Galón',
    price: 160000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30 para motores gasolina. Presentación: Galón.',
    image: '/images/products/105.png'
  },
  {
    id: 121,
    name: 'Aceite Mobil 10W30 — ¼ Galón',
    price: 45000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30 para motores gasolina. Presentación: Cuarto de galón.',
    image: '/images/products/121.png'
  },
  {
    id: 126,
    name: 'Aceite Motorcraft 10W30 — ¼ Galón',
    price: 42000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 10W30 Semi-Sintético. Presentación: Cuarto de galón.',
    image: '/images/products/126.png'
  },
  {
    id: 110,
    name: 'Aceite Motorcraft 5W30 — ¼ Galón',
    price: 55000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 5W30 Full Sintético para Ford Ranger 2025-2026. Presentación: Cuarto de galón.',
    image: '/images/products/110.png'
  },

  // ============================================================
  // 6. KITS (Packs Completos por Vehículo)
  // ============================================================
  {
    id: 101,
    name: 'KIT Toyota Revo — Pack Completo',
    price: 390000,
    category: Category.KITS,
    description: 'Pack completo de filtros para Toyota Revo. Incluye: AIP 977, ACP 138, OLP 067, FLP 476 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/101.png'
  },
  {
    id: 103,
    name: 'KIT Toyota Vigo — Pack Completo',
    price: 385000,
    category: Category.KITS,
    description: 'Pack completo de filtros para Toyota Vigo. Incluye: AIP 651, ACP 071, OLP 067, FLP 355 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/103.png'
  },
  {
    id: 104,
    name: 'KIT Nissan NP300 Gasolina — Pack Completo',
    price: 295000,
    category: Category.KITS,
    description: 'Pack de filtros para Nissan NP 300 Motor Gasolina. Incluye: AIP 961, ACP 123, OLP 019 + Aceite Mobil 10W30 (1 galón + 1 cuarto).',
    image: '/images/products/104.png'
  },
  {
    id: 106,
    name: 'KIT Nissan NP300 Diesel — Pack Completo',
    price: 415000,
    category: Category.KITS,
    description: 'Pack de filtros para Nissan NP 300 Motor Diesel. Incluye: AIP 961, ACP 123, OLP 077, FLP 471 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/106.png'
  },
  {
    id: 107,
    name: 'KIT Ford Ranger Filtros Nacionales — Pack Completo',
    price: 655000,
    category: Category.KITS,
    description: 'Pack de filtros nacionales para Ford Ranger. Incluye: AIP 892, OLP 115, ACP 120, FLP 509 + 10 cuartos Motorcraft 10W30.',
    image: '/images/products/107.png'
  },
  {
    id: 108,
    name: 'KIT Ford Ranger Original 2022–2024 — Pack Completo',
    price: 1025000,
    category: Category.KITS,
    description: 'Pack de filtros originales Ford para Ranger 2022-2024. Incluye: EB3Z-9365B, JU2Z-6731A, MG2MZ9601B, HB3Z19N619B + 10 cuartos Motorcraft 10W30.',
    image: '/images/products/108.png'
  },
  {
    id: 109,
    name: 'KIT Ford Ranger Original 2025–2026 — Pack Completo',
    price: 1420000,
    category: Category.KITS,
    description: 'Pack de filtros originales Ford para Ranger 2025-2026. Incluye: KV61-9155AG, JU2Z-6731A, MB3Z-9601C, MB3Z19N619C + 8 cuartos Motorcraft 5W30.',
    image: '/images/products/109.png'
  },
];
