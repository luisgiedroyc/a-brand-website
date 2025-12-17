
import React, { useState, useMemo, useEffect } from 'react';
import { Screen, NavigationTarget, ProductID } from './types';
import NoiseBackground from './components/NoiseBackground';
import Navigation from './components/Navigation';
import ProductView from './components/ProductView';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME, getGridCellSize } from './constants';
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.ENTRANCE);
  const [navTarget, setNavTarget] = useState<NavigationTarget | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductID>('orb');
  const [cellSize, setCellSize] = useState(getGridCellSize());

  useEffect(() => {
    const handleResize = () => setCellSize(getGridCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateTo = (targetScreen: Screen, data?: any) => {
    if (targetScreen === Screen.NAVIGATE) setNavTarget(data as NavigationTarget);
    if (targetScreen === Screen.PRODUCT) setSelectedProduct(data as ProductID);
    setScreen(targetScreen);
  };

  const goBack = () => {
    if (screen === Screen.PRODUCT) setScreen(Screen.NAVIGATE);
    else if (screen === Screen.NAVIGATE) setScreen(Screen.ENTRANCE);
  };

  const getShift = () => {
    switch (screen) {
      case Screen.ENTRANCE: return '0vw';
      case Screen.NAVIGATE: return '-100vw';
      case Screen.PRODUCT: return '-200vw';
      default: return '0vw';
    }
  };

  const entranceTriggers = useMemo(() => [
    {
      id: 'concept',
      text: 'КОНЦЕПЦИЯ',
      row: cellSize < 36 ? 8 : 10,
      col: cellSize < 36 ? 1 : 4, 
      color: THEME.pink,
      onClick: () => navigateTo(Screen.NAVIGATE, NavigationTarget.CONCEPT)
    },
    {
      id: 'products',
      text: 'ПРОДУКТЫ',
      row: cellSize < 36 ? 11 : 13,
      col: cellSize < 36 ? 1 : 4, 
      color: THEME.cyan,
      onClick: () => navigateTo(Screen.NAVIGATE, NavigationTarget.PRODUCTS)
    }
  ], [cellSize]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Branding Logo */}
      <motion.div 
        className="fixed z-[100] font-black text-2xl md:text-4xl tracking-tighter cursor-pointer px-4 md:px-6 py-2 border border-black/5 bg-white/60 backdrop-blur-xl"
        style={{ top: cellSize, right: cellSize }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setScreen(Screen.ENTRANCE)}
      >
        A!
      </motion.div>

      {/* Navigation Control: Back Button */}
      <div 
        className="fixed z-[100] flex items-center" 
        style={{ top: cellSize, left: cellSize }}
      >
        <AnimatePresence>
          {screen !== Screen.ENTRANCE && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="cursor-pointer group flex items-center gap-3 md:gap-4 bg-white/60 backdrop-blur-xl p-1 md:p-2 pr-4 md:pr-6 border border-black/5 rounded-sm shadow-sm"
              onClick={goBack}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.3em]">Назад</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Panoramas */}
      <motion.div 
        className="flex h-full w-[300vw] touch-none"
        animate={{ x: getShift() }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Screen 1: Entrance */}
        <div className="w-screen h-full relative flex-none">
          <NoiseBackground triggers={entranceTriggers} mode="search" />
        </div>

        {/* Screen 2: Navigation Content */}
        <div className="w-screen h-full relative flex-none border-x border-black/5">
          <Navigation 
            target={navTarget || NavigationTarget.PRODUCTS} 
            onBack={goBack}
            onSelectProduct={(id) => navigateTo(Screen.PRODUCT, id)}
          />
        </div>

        {/* Screen 3: Detailed Product View */}
        <div className="w-screen h-full relative flex-none">
          <ProductView 
            productId={selectedProduct} 
            onBack={goBack} 
          />
        </div>
      </motion.div>

      {/* Global Aesthetics Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default App;
