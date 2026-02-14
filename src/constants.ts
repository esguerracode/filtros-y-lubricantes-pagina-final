
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
  // KIT TOYOTA REVO - $390,000
  // ============================================================
  {
    id: 101,
    name: 'KIT TOYOTA REVO (Pack Completo)',
    price: 390000,
    category: Category.FILTROS,
    description: 'Pack completo de filtros para Toyota Revo. Incluye: AIP 977, ACP 138, OLP 067, FLP 476 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/101.png'
  },
  {
    id: 111,
    name: 'Filtro Aire AIP 977 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Toyota Revo.',
    image: '/images/products/111.jpeg'
  },
  {
    id: 112,
    name: 'Filtro Cabina ACP 138 (Toyota Revo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Toyota Revo.',
    image: '/images/products/112.jpeg'
  },
  {
    id: 113,
    name: 'Filtro Aceite OLP 067 (Toyota Revo)',
    price: 15000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Toyota Revo.',
    image: '/images/products/113.jpeg'
  },
  {
    id: 114,
    name: 'Filtro Combustible FLP 476 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Toyota Revo.',
    image: '/images/products/114.jpeg'
  },
  {
    id: 102,
    name: 'Mobil Delvac 15W40 Galón',
    price: 125000,
    category: Category.LUBRICANTES,
    description: 'Aceite Mobil Delvac MX 15W-40 para motores diesel. Presentación: Galón.',
    image: '/images/products/102.jpeg'
  },

  // ============================================================
  // KIT TOYOTA VIGO - $385,000
  // ============================================================
  {
    id: 103,
    name: 'KIT TOYOTA VIGO (Pack Completo)',
    price: 385000,
    category: Category.FILTROS,
    description: 'Pack completo de filtros para Toyota Vigo. Incluye: AIP 651, ACP 071, OLP 067, FLP 355 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/103.jpeg'
  },
  {
    id: 115,
    name: 'Filtro Aire AIP 651 (Toyota Vigo)',
    price: 50000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Toyota Vigo.',
    image: '/images/products/115.jpeg'
  },
  {
    id: 116,
    name: 'Filtro Cabina ACP 071 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Toyota Vigo.',
    image: '/images/products/116.jpeg'
  },
  {
    id: 117,
    name: 'Filtro Combustible FLP 355 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Toyota Vigo.',
    image: '/images/products/117.jpeg'
  },

  // ============================================================
  // KIT NISSAN NP 300 GASOLINA - $295,000
  // ============================================================
  {
    id: 104,
    name: 'KIT NISSAN NP 300 GASOLINA (Pack)',
    price: 295000,
    category: Category.FILTROS,
    description: 'Pack de filtros para Nissan NP 300 Motor Gasolina. Incluye: AIP 961, ACP 123, OLP 019 + Aceite Mobil 10W30.',
    image: '/images/products/104.png'
  },
  {
    id: 118,
    name: 'Filtro Aire AIP 961 (Nissan NP300)',
    price: 40000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Nissan NP 300.',
    image: '/images/products/118.png'
  },
  {
    id: 119,
    name: 'Filtro Cabina ACP 123 (Nissan NP300)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Nissan NP 300.',
    image: '/images/products/119.jpeg'
  },
  {
    id: 120,
    name: 'Filtro Aceite OLP 019 (Nissan NP300)',
    price: 15000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Nissan NP 300.',
    image: '/images/products/120.jpeg'
  },
  {
    id: 105,
    name: 'Aceite Mobil 10W30 Galón',
    price: 160000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30 para motores gasolina. Presentación: Galón.',
    image: '/images/products/105.jpeg'
  },
  {
    id: 121,
    name: 'Aceite Mobil 10W30 (1/4 Galón)',
    price: 45000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30. Presentación: Cuarto de galón.',
    image: '/images/products/121.jpeg'
  },

  // ============================================================
  // KIT NISSAN NP 300 DIESEL - $415,000
  // ============================================================
  {
    id: 106,
    name: 'KIT NISSAN NP 300 DIESEL (Pack)',
    price: 415000,
    category: Category.FILTROS,
    description: 'Pack de filtros para Nissan NP 300 Motor Diesel. Incluye: AIP 961, ACP 123, OLP 077, FLP 472 + 2 galones Mobil Delvac 15W40.',
    image: '/images/products/106.png'
  },
  {
    id: 122,
    name: 'Filtro Aceite OLP 077 (Nissan NP300 Diesel)',
    price: 25000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Nissan NP 300 Diesel.',
    image: '/images/products/122.jpeg'
  },
  {
    id: 123,
    name: 'Filtro Combustible FLP 472 (Nissan NP300 Diesel)',
    price: 65000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Nissan NP 300 Diesel.',
    image: '/images/products/123.jpeg'
  },

  // ============================================================
  // KIT FORD RANGER NACIONAL - $655,000
  // ============================================================
  {
    id: 107,
    name: 'KIT FORD RANGER FILTROS NACIONALES (Pack)',
    price: 655000,
    category: Category.FILTROS,
    description: 'Pack de filtros nacionales para Ford Ranger. Incluye: AIP 892, OLP 115, ACP 120, FLP 509 + 10 cuartos Motorcraft 10W30.',
    image: '/images/products/107.jpeg'
  },
  {
    id: 124,
    name: 'Filtro Aceite OLP 115 (Ford Ranger)',
    price: 25000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Ford Ranger.',
    image: '/images/products/124.jpeg'
  },
  {
    id: 125,
    name: 'Filtro Combustible FLP 509 (Ford Ranger)',
    price: 100000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Ford Ranger.',
    image: '/images/products/125.jpeg'
  },
  {
    id: 126,
    name: 'Aceite Motorcraft 10W30 (1/4 Galón)',
    price: 42000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 10W30 Semi-Sintético. Presentación: Cuarto de galón.',
    image: '/images/products/126.jpeg'
  },

  // ============================================================
  // KIT FORD RANGER ORIGINAL 2022-2024 - $1,025,000
  // ============================================================
  {
    id: 108,
    name: 'KIT FORD RANGER ORIGINAL 2022-2024 (Pack)',
    price: 1025000,
    category: Category.FILTROS,
    description: 'Pack de filtros originales Ford para Ranger 2022-2024. Incluye: EB3Z-9365B, JU2Z-6731A, MG2MZ9601B, HB3Z19N619B + 10 cuartos Motorcraft 10W30.',
    image: '/images/products/108.jpeg'
  },
  {
    id: 127,
    name: 'Filtro Combustible EB3Z-9365B (Ford Original)',
    price: 300000,
    category: Category.FILTROS,
    description: 'Filtro de combustible original Ford EB3Z-9365B para Ranger 2022-2024.',
    image: '/images/products/127.jpeg'
  },
  {
    id: 128,
    name: 'Filtro Aire Motor MG2MZ9601B (Ford Original)',
    price: 185000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor original Ford MG2MZ9601B para Ranger 2022-2024.',
    image: '/images/products/128.jpeg'
  },
  {
    id: 129,
    name: 'Filtro Aceite JU2Z-6731A (Ford Original)',
    price: 60000,
    category: Category.FILTROS,
    description: 'Filtro de aceite original Ford JU2Z-6731A para Ranger 2022-2024.',
    image: '/images/products/129.jpeg'
  },
  {
    id: 130,
    name: 'Filtro Aire Acondicionado HB3Z19N619B (Ford Original)',
    price: 60000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado original Ford HB3Z19N619B para Ranger 2022-2024.',
    image: '/images/products/130.jpeg'
  },

  // ============================================================
  // KIT FORD RANGER ORIGINAL 2025-2026 - $1,420,000
  // ============================================================
  {
    id: 109,
    name: 'KIT FORD RANGER ORIGINAL 2025-2026 (Pack)',
    price: 1420000,
    category: Category.FILTROS,
    description: 'Pack de filtros originales Ford para Ranger 2025-2026. Incluye: KV61-9155AG, JU2Z-6731A, MB3Z-9601C, MB3Z19N619C + 8 cuartos Motorcraft 5W30.',
    image: '/images/products/109.jpeg'
  },
  {
    id: 131,
    name: 'Filtro Combustible KV61-9155AG (Ford Original 2025)',
    price: 600000,
    category: Category.FILTROS,
    description: 'Filtro de combustible original Ford KV61-9155AG para Ranger 2025-2026.',
    image: '/images/products/131.jpeg'
  },
  {
    id: 132,
    name: 'Filtro Aire Motor MB3Z-9601C (Ford Original 2025)',
    price: 210000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor original Ford MB3Z-9601C para Ranger 2025-2026.',
    image: '/images/products/132.jpeg'
  },
  {
    id: 133,
    name: 'Filtro Aire Acondicionado MB3Z19N619C (Ford Original 2025)',
    price: 110000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado original Ford MB3Z19N619C para Ranger 2025-2026.',
    image: '/images/products/133.jpeg'
  },
  {
    id: 110,
    name: 'Aceite Motorcraft 5W30 (1/4 Galón)',
    price: 55000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 5W30 Full Sintético. Presentación: Cuarto de galón.',
    image: '/images/products/110.png'
  }
];
