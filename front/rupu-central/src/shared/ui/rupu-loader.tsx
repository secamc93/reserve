/**
 * Componente Loader con animaci?n Lottie de Rup?
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import rupuLoaderAnimation from '../image/rupu_loader.json';

// Importar Lottie din?micamente para evitar errores si no est? instalado
const Lottie = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent"></div>
    </div>
  )
});

interface RupuLoaderProps {
  size?: number;
  className?: string;
}

export function RupuLoader({ size = 128, className = '' }: RupuLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Procesar la animaci?n para asegurar que las rutas de im?genes sean correctas
  const processedAnimation = useMemo(() => {
    if (!mounted) return rupuLoaderAnimation;
    
    // Clonar la animaci?n y asegurar que las rutas de im?genes sean absolutas
    const animation = JSON.parse(JSON.stringify(rupuLoaderAnimation));
    if (animation.assets && Array.isArray(animation.assets)) {
      animation.assets.forEach((asset: any) => {
        if (asset.u && !asset.u.startsWith('/') && !asset.u.startsWith('http')) {
          // Asegurar que la ruta comience con /
          asset.u = asset.u.startsWith('/') ? asset.u : `/${asset.u}`;
        }
      });
    }
    return animation;
  }, [mounted]);

  // Fallback spinner si hay error o no est? montado
  if (!mounted || hasError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div 
          className="animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
          style={{ width: size, height: size }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center rupu-loader-wrapper ${className}`} 
      style={{ 
        width: size, 
        height: size,
        backgroundColor: 'transparent',
        position: 'relative'
      }}
    >
      <div 
        style={{ 
          backgroundColor: 'transparent', 
          width: size, 
          height: size,
          position: 'relative',
          animation: 'rupuRotate 4.68s linear infinite'
        }}
        className="lottie-container rupu-rotate"
      >
        <Lottie
          animationData={processedAnimation}
          style={{ 
            width: size, 
            height: size,
            backgroundColor: 'transparent',
            display: 'block'
          }}
          loop={true}
          autoplay={true}
          onError={(error: any) => {
            console.error('Error cargando animación Lottie:', error);
            setHasError(true);
          }}
          onLoadedImages={(images: any) => {
            // Verificar que las imágenes se cargaron correctamente
            if (images && images.length === 0) {
              console.warn('No se cargaron imágenes para la animación Lottie');
            }
          }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
            className: 'lottie-animation',
            hideOnTransparent: true,
          }}
          renderer="svg"
        />
      </div>
    </div>
  );
}
