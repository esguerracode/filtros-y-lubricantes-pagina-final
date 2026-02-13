
export enum Category {
  LUBRICANTES = 'Lubricantes',
  FILTROS = 'Filtros',
  BATERIAS = 'Baterías',
  LLANTAS = 'Llantas'
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
