
import React, { useState, useEffect } from 'react';
import { ProductID } from '../types';
import { PRODUCTS, getGridCellSize } from '../constants';
import ThreeScene from './ThreeScene';
import NoiseBackground from './NoiseBackground';
import { motion } from 'framer-motion';

interface ProductViewProps {
  productId: ProductID;
  onBack: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ productId, onBack }) => {
  const product = PRODUCTS[productId];
  const [cellSize, setCellSize] = useState(getGridCellSize());

  useEffect(() => {
    const handleResize = () => setCellSize(getGridCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const horizontalPadding = cellSize * (cellSize < 36 ? 1 : 2);

  return (
    <div className="w-full h-full relative bg-white overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <NoiseBackground triggers={[]} mode="reveal" />
      </div>
      
      {/* Product Hero: 3D Scene */}
      <div className="relative w-full h-[60vh] md:h-[75vh] z-10 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl">
          <ThreeScene productId={productId} />
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="relative z-20"
        style={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding }}
      >
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Title & Description */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 md:gap-12 border-b border-black/10 pb-12 md:pb-16 mb-12 md:mb-16">
            <div className="space-y-6 md:space-y-8">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-black/20 block">
                Series 01 / {productId.toUpperCase()}
              </span>
              <h2 className="text-5xl sm:text-7xl lg:text-9xl font-light uppercase tracking-tighter leading-[0.85]">
                {product.name}
              </h2>
              <p className="text-xl md:text-2xl text-black/40 leading-relaxed font-light max-w-lg">
                {product.description}
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <button className="w-full md:w-auto group relative overflow-hidden bg-black text-white px-12 md:px-16 py-5 md:py-6 border border-black hover:bg-transparent hover:text-black transition-all duration-700">
                <span className="relative z-10 font-bold uppercase tracking-[0.4em] text-[10px]">Заказать</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </button>
            </div>
          </div>

          {/* Technical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 py-12">
            <div className="space-y-10">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] border-l-2 border-black pl-4">Спецификации</h3>
              <div className="space-y-6 font-mono text-[11px] uppercase tracking-widest text-black/40">
                <div className="flex justify-between border-b border-black/5 pb-3">
                  <span>Материал</span>
                  <span className="text-black font-bold">Акрил / Сталь</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-3">
                  <span>Свет</span>
                  <span className="text-black font-bold">2700K - 4000K</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-3">
                  <span>Защита</span>
                  <span className="text-black font-bold">IP20</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-10">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] border-l-2 border-black pl-4">О продукте</h3>
              <p className="text-base md:text-lg leading-relaxed text-black/60 font-light">
                {product.details} Каждое изделие проходит ручную доводку поверхности для обеспечения идеального матового финиша.
              </p>
            </div>
          </div>

          {/* Visualization Placeholder */}
          <div className="pt-32 md:pt-40 border-t border-black/10 space-y-16">
            <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-black/30 text-center">Контекст</h3>
            
            <div className="relative group overflow-hidden bg-neutral-100 aspect-square md:aspect-[21/9] border border-black/5 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 p-12 text-center opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="w-px h-24 bg-black" />
                <span className="text-[10px] uppercase tracking-[1.2em]">Архитектурная Визуализация</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-40 border-t border-black/5 py-16 text-center">
        <span className="font-mono text-[9px] tracking-[1.5em] uppercase text-black/10">A! / ALL RIGHTS RESERVED 2024</span>
      </div>
    </div>
  );
};

export default ProductView;
