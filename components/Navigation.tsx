
import React, { useMemo, useState, useEffect } from 'react';
import { NavigationTarget, ProductID } from '../types';
import { PRODUCTS, THEME, getGridCellSize } from '../constants';
import NoiseBackground, { Trigger } from './NoiseBackground';
import { motion } from 'framer-motion';

interface NavigationProps {
  target: NavigationTarget;
  onBack: () => void;
  onSelectProduct: (id: ProductID) => void;
}

const Navigation: React.FC<NavigationProps> = ({ target, onBack, onSelectProduct }) => {
  const [cellSize, setCellSize] = useState(getGridCellSize());

  useEffect(() => {
    const handleResize = () => setCellSize(getGridCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggers = useMemo(() => {
    const list: Trigger[] = [];
    const rowsCount = Math.floor(window.innerHeight / cellSize);

    if (target === NavigationTarget.PRODUCTS) {
      Object.values(PRODUCTS).forEach((p, i) => {
        list.push({
          id: p.id,
          text: p.name,
          row: Math.floor(rowsCount * 0.4) + (i * 4),
          col: cellSize < 36 ? 1 : 4,
          color: THEME.cyan,
          onClick: () => onSelectProduct(p.id as ProductID)
        });
      });
    }

    return list;
  }, [target, onBack, onSelectProduct, cellSize]);

  const leftOffset = cellSize * (cellSize < 36 ? 1 : 2);

  return (
    <div className="w-full h-full relative bg-white">
      <NoiseBackground triggers={triggers} mode="reveal" />
      
      {target === NavigationTarget.CONCEPT && (
        <motion.div 
          className="absolute top-[25%] md:top-[30%] max-w-2xl pointer-events-none px-6 md:px-0"
          style={{ left: leftOffset }}
          initial={{ opacity: 0, x: -cellSize }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-light tracking-tighter mb-10 md:mb-12 leading-[0.8] uppercase">
            A! <br/><span style={{ color: THEME.pink }} className="font-normal italic">ETHOS</span>
          </h1>
          <p className="text-lg md:text-2xl text-black/40 leading-relaxed font-light tracking-wide max-w-xs md:max-w-md">
            Мы проектируем тишину через свет. <br/>
            Свет как архитектурный материал. <br/>
            Форма как функция пространства.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Navigation;
