
import { Product } from './types';

export const LETTERS = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const PRODUCTS: Record<string, Product> = {
  orb: {
    id: 'orb',
    name: 'A! ORB',
    description: 'Сферический светильник с мягким рассеянным светом.',
    details: 'Минималистичная сфера, созданная для того, чтобы стать центром притяжения в любом современном интерьере. Идеальный баланс формы и функции.',
    modelPath: './orb.glb'
  },
  pleat: {
    id: 'pleat',
    name: 'A! PLEAT',
    description: 'Светильник со складчатой структурой и игрой теней.',
    details: 'Геометрическое совершенство в каждой складке. Сложная поверхность создает уникальный световой рисунок на окружающих предметах.',
    modelPath: './pleat.glb'
  }
};

/**
 * Returns an appropriate grid cell size based on the window width.
 * Used for both the background grid and UI positioning.
 */
export const getGridCellSize = () => {
  if (typeof window === 'undefined') return 42;
  // Mobile: smaller grid for higher density; Tablet/Desktop: standard grid.
  if (window.innerWidth < 768) return 32;
  if (window.innerWidth < 1024) return 36;
  return 42;
};

export const THEME = {
  pink: '#d400d4',
  cyan: '#00b4b4',
  gray: '#f0f0f0', 
  black: '#000000',
  white: '#ffffff'
};
