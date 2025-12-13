/**
 * Componente Spinner/Loader reutilizable
 * Usa la animación Lottie de Rupü
 */

'use client';

import { RupuLoader } from './rupu-loader';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'white';
  text?: string;
}

// Mapeo de tamaños a píxeles para RupuLoader
const sizeMap = {
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128,
};

export function Spinner({ size = 'md', color = 'primary', text }: SpinnerProps) {
  const loaderSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <RupuLoader size={loaderSize} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * Spinner de página completa (overlay)
 */
export function FullPageSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <RupuLoader size={128} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

