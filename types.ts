export enum Screen {
  ENTRANCE = 'ENTRANCE',
  NAVIGATE = 'NAVIGATE',
  PRODUCT = 'PRODUCT'
}

export enum NavigationTarget {
  CONCEPT = 'CONCEPT',
  PRODUCTS = 'PRODUCTS'
}

export type ProductID = 'orb' | 'pleat';

export interface Product {
  id: ProductID;
  name: string;
  description: string;
  details: string;
  modelPath?: string;
}