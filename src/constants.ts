
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
    image: 'https://picsum.photos/seed/kitrevo/400/400'
  },
  {
    id: 111,
    name: 'Filtro Aire AIP 977 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Toyota Revo.',
    image: 'https://pics um.photos/seed/aip977/400/400'
  },
  {
    id: 112,
    name: 'Filtro Cabina ACP 138 (Toyota Revo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Toyota Revo.',
    image: 'https://picsum.photos/seed/acp138/400/400'
  },
  {
    id: 113,
    name: 'Filtro Aceite OLP 067 (Toyota Revo)',
    price: 15000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Toyota Revo.',
    image: 'https://picsum.photos/seed/olp067/400/400'
  },
  {
    id: 114,
    name: 'Filtro Combustible FLP 476 (Toyota Revo)',
    price: 45000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Toyota Revo.',
    image: 'https://picsum.photos/seed/flp476/400/400'
  },
  {
    id: 102,
    name: 'Mobil Delvac 15W40 Galón',
    price: 125000,
    category: Category.LUBRICANTES,
    description: 'Aceite Mobil Delvac MX 15W-40 para motores diesel. Presentación: Galón.',
    image: 'https://picsum.photos/seed/mobil15w40/400/400'
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
    image: 'https://picsum.photos/seed/kitvigo/400/400'
  },
  {
    id: 115,
    name: 'Filtro Aire AIP 651 (Toyota Vigo)',
    price: 50000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Toyota Vigo.',
    image: 'https://picsum.photos/seed/aip651/400/400'
  },
  {
    id: 116,
    name: 'Filtro Cabina ACP 071 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Toyota Vigo.',
    image: 'https://picsum.photos/seed/acp071/400/400'
  },
  {
    id: 117,
    name: 'Filtro Combustible FLP 355 (Toyota Vigo)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Toyota Vigo.',
    image: 'https://picsum.photos/seed/flp355/400/400'
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
    image: 'https://picsum.photos/seed/kitnissangas/400/400'
  },
  {
    id: 118,
    name: 'Filtro Aire AIP 961 (Nissan NP300)',
    price: 40000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor para Nissan NP 300.',
    image: 'https://picsum.photos/seed/aip961/400/400'
  },
  {
    id: 119,
    name: 'Filtro Cabina ACP 123 (Nissan NP300)',
    price: 35000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado para Nissan NP 300.',
    image: 'https://picsum.photos/seed/acp123/400/400'
  },
  {
    id: 120,
    name: 'Filtro Aceite OLP 019 (Nissan NP300)',
    price: 15000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Nissan NP 300.',
    image: 'https://picsum.photos/seed/olp019/400/400'
  },
  {
    id: 105,
    name: 'Aceite Mobil 10W30 Galón',
    price: 160000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30 para motores gasolina. Presentación: Galón.',
    image: 'https://picsum.photos/seed/mobil10w30g/400/400'
  },
  {
    id: 121,
    name: 'Aceite Mobil 10W30 (1/4 Galón)',
    price: 45000,
    category: Category.LUBRICANTES,
    description: 'Aceite lubricante Mobil 10W30. Presentación: Cuarto de galón.',
    image: 'https://picsum.photos/seed/mobil10w30q/400/400'
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
    image: 'https://picsum.photos/seed/kitnissandie/400/400'
  },
  {
    id: 122,
    name: 'Filtro Aceite OLP 077 (Nissan NP300 Diesel)',
    price: 25000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Nissan NP 300 Diesel.',
    image: 'https://picsum.photos/seed/olp077/400/400'
  },
  {
    id: 123,
    name: 'Filtro Combustible FLP 472 (Nissan NP300 Diesel)',
    price: 65000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Nissan NP 300 Diesel.',
    image: 'https://picsum.photos/seed/flp472/400/400'
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
    image: 'https://picsum.photos/seed/kitfordnac/400/400'
  },
  {
    id: 124,
    name: 'Filtro Aceite OLP 115 (Ford Ranger)',
    price: 25000,
    category: Category.FILTROS,
    description: 'Filtro de aceite para Ford Ranger.',
    image: 'https://picsum.photos/seed/olp115/400/400'
  },
  {
    id: 125,
    name: 'Filtro Combustible FLP 509 (Ford Ranger)',
    price: 100000,
    category: Category.FILTROS,
    description: 'Filtro de combustible para Ford Ranger.',
    image: 'https://picsum.photos/seed/flp509/400/400'
  },
  {
    id: 126,
    name: 'Aceite Motorcraft 10W30 (1/4 Galón)',
    price: 42000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 10W30 Semi-Sintético. Presentación: Cuarto de galón.',
    image: 'https://picsum.photos/seed/mc10w30/400/400'
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
    image: 'https://picsum.photos/seed/kitfordorg22/400/400'
  },
  {
    id: 127,
    name: 'Filtro Combustible EB3Z-9365B (Ford Original)',
    price: 300000,
    category: Category.FILTROS,
    description: 'Filtro de combustible original Ford EB3Z-9365B para Ranger 2022-2024.',
    image: 'https://picsum.photos/seed/eb3z/400/400'
  },
  {
    id: 128,
    name: 'Filtro Aire Motor MG2MZ9601B (Ford Original)',
    price: 185000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor original Ford MG2MZ9601B para Ranger 2022-2024.',
    image: 'https://picsum.photos/seed/mg2mz/400/400'
  },
  {
    id: 129,
    name: 'Filtro Aceite JU2Z-6731A (Ford Original)',
    price: 60000,
    category: Category.FILTROS,
    description: 'Filtro de aceite original Ford JU2Z-6731A para Ranger 2022-2024.',
    image: 'https://picsum.photos/seed/ju2z/400/400'
  },
  {
    id: 130,
    name: 'Filtro Aire Acondicionado HB3Z19N619B (Ford Original)',
    price: 60000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado original Ford HB3Z19N619B para Ranger 2022-2024.',
    image: 'https://picsum.photos/seed/hb3z/400/400'
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
    image: 'https://picsum.photos/seed/kitfordorg25/400/400'
  },
  {
    id: 131,
    name: 'Filtro Combustible KV61-9155AG (Ford Original 2025)',
    price: 600000,
    category: Category.FILTROS,
    description: 'Filtro de combustible original Ford KV61-9155AG para Ranger 2025-2026.',
    image: 'https://picsum.photos/seed/kv61/400/400'
  },
  {
    id: 132,
    name: 'Filtro Aire Motor MB3Z-9601C (Ford Original 2025)',
    price: 210000,
    category: Category.FILTROS,
    description: 'Filtro de aire motor original Ford MB3Z-9601C para Ranger 2025-2026.',
    image: 'https://picsum.photos/seed/mb3z9601/400/400'
  },
  {
    id: 133,
    name: 'Filtro Aire Acondicionado MB3Z19N619C (Ford Original 2025)',
    price: 110000,
    category: Category.FILTROS,
    description: 'Filtro de aire acondicionado original Ford MB3Z19N619C para Ranger 2025-2026.',
    image: 'https://picsum.photos/seed/mb3z19/400/400'
  },
  {
    id: 110,
    name: 'Aceite Motorcraft 5W30 (1/4 Galón)',
    price: 55000,
    category: Category.LUBRICANTES,
    description: 'Aceite Motorcraft 5W30 Full Sintético. Presentación: Cuarto de galón.',
    image: 'https://picsum.photos/seed/mc5w30/400/400'
  }
];
