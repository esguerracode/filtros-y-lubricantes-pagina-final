
export enum Category {
  FILTROS_ACEITE = 'Filtros Aceite',
  FILTROS_AIRE_MOTOR = 'Filtros Aire Motor',
  FILTROS_AIRE_AC = 'Filtros Aire Acondicionado',
  FILTROS_COMBUSTIBLE = 'Filtros Combustible',
  LUBRICANTES = 'Lubricantes',
  KITS = 'Kits',
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  description: string;
  specs?: string;
  image: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
