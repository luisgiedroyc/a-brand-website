
import React, { useRef, useEffect, useState } from 'react';
import { LETTERS, getGridCellSize, THEME } from '../constants';

export interface Trigger {
  id: string;
  text: string;
  row: number;
  col: number;
  color: string;
  onClick: () => void;
}

interface NoiseBackgroundProps {
  triggers: Trigger[];
  mode: 'search' | 'reveal';
}

const NoiseBackground: React.FC<NoiseBackgroundProps> = ({ triggers, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: -2000, y: -2000 });
  const hoveredIdRef = useRef<string | null>(null);
  const [cellSize, setCellSize] = useState(getGridCellSize());

  useEffect(() => {
    const handleResizeSize = () => setCellSize(getGridCellSize());
    window.addEventListener('resize', handleResizeSize);
    return () => window.removeEventListener('resize', handleResizeSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      tick++;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      const fontSize = cellSize < 40 ? 10 : 12;
      const baseFont = `400 ${fontSize}px "Inter", sans-serif`;
      const hoverFont = `900 ${fontSize}px "Inter", sans-serif`;
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cols = Math.ceil(window.innerWidth / cellSize);
      const rows = Math.ceil(window.innerHeight / cellSize);

      const mX = mousePosRef.current.x;
      const mY = mousePosRef.current.y;

      let currentHovered: string | null = null;
      for (const t of triggers) {
        const triggerWidth = t.text.length * cellSize;
        const triggerXStart = t.col * cellSize;
        const triggerYStart = t.row * cellSize;
        
        if (
          mX >= triggerXStart && mX <= triggerXStart + triggerWidth &&
          mY >= triggerYStart && mY <= triggerYStart + cellSize
        ) {
          currentHovered = t.id;
          break;
        }
      }
      hoveredIdRef.current = currentHovered;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;
          
          const dx = x - mX;
          const dy = y - mY;
          const distSq = dx * dx + dy * dy;
          
          const radius = cellSize < 40 ? 70 : 100;
          const intensity = Math.max(0, 1 - Math.sqrt(distSq) / radius);

          let triggerFound = null;
          let charIndex = -1;
          for (const t of triggers) {
            if (r === t.row && c >= t.col && c < t.col + t.text.length) {
              triggerFound = t;
              charIndex = c - t.col;
              break;
            }
          }

          if (triggerFound) {
            const char = triggerFound.text[charIndex];
            const isHovered = hoveredIdRef.current === triggerFound.id;
            const isRevealed = mode === 'reveal' || isHovered;

            ctx.font = isHovered ? hoverFont : baseFont;

            if (isRevealed) {
              ctx.globalAlpha = 1;
              ctx.fillStyle = isHovered ? triggerFound.color : THEME.black;
            } else {
              const threshold = 0.4;
              const revealedAlpha = intensity > threshold ? (intensity - threshold) / (1 - threshold) : 0;
              ctx.globalAlpha = revealedAlpha;
              ctx.fillStyle = THEME.black;
            }
            ctx.fillText(char, x, y);
          } else {
            ctx.font = baseFont;
            const char = LETTERS[(r * 7 + c * 3 + Math.floor(tick / 50)) % LETTERS.length];
            
            ctx.globalAlpha = 0.04 + (intensity * 0.12);
            ctx.fillStyle = intensity > 0.1 ? THEME.black : THEME.gray;
            ctx.fillText(char, x, y);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [triggers, mode, cellSize]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    mousePosRef.current = { x: clientX, y: clientY };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -2000, y: -2000 };
  };

  const handleClick = () => {
    if (hoveredIdRef.current) {
      const trigger = triggers.find(t => t.id === hoveredIdRef.current);
      trigger?.onClick();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      onClick={handleClick}
      style={{ touchAction: 'none' }}
    />
  );
};

export default NoiseBackground;
