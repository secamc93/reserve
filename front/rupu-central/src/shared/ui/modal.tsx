/**
 * Componente Modal reutilizable
 * Usa clases globales definidas en globals.css
 */

'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  glass?: boolean; // Efecto glassmorphism
  className?: string; // Clases adicionales para el contenedor del modal
}

const sizeClasses = {
  sm: 'max-w-sm w-[calc(100%-2rem)] sm:w-full',
  md: 'max-w-md w-[calc(100%-2rem)] sm:w-full',
  lg: 'max-w-lg w-[calc(100%-2rem)] sm:w-full',
  xl: 'max-w-xl w-[calc(100%-2rem)] sm:w-full',
  '2xl': 'max-w-2xl w-[calc(100%-2rem)] sm:w-full',
  '4xl': 'max-w-4xl w-[calc(100%-2rem)] sm:w-full',
  '6xl': 'max-w-6xl w-[calc(100%-2rem)] sm:w-full',
  'full': 'max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] mx-auto my-[5vh]',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', glass = false, className = '' }: ModalProps) {
  console.log('🔧 Modal - isOpen:', isOpen, 'title:', title);
  
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className={size === 'full' ? 'fixed inset-0 z-50 flex items-center justify-center' : 'modal'}>
        {size === 'full' ? (
          <div 
            className={`${glass ? 'bg-transparent' : 'bg-transparent'} flex flex-col overflow-hidden`}
            style={{
              width: '90vw',
              height: '90vh',
              maxWidth: '90vw',
              maxHeight: '90vh',
              minWidth: '90vw',
              minHeight: '90vh'
            }}
          >
            {/* Content */}
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        ) : (
          <div className={`${glass ? 'modal-glass' : 'modal-content'} ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}>
            {/* Header */}
            {title && (
              <div className="relative mb-4 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center pr-8">{title}</h3>
                <button
                  onClick={onClose}
                  className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Cerrar modal"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
          </div>
        )}
      </div>
    </>
  );
}

