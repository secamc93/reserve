/**
 * Panel flotante grande: ocupa el 90 % del ancho y del alto de la ventana sobre la pantalla
 * de fondo, que queda difuminada. Se cierra con Esc, con el fondo o con el botón de cierre que
 * ponga el contenido. En teléfono ocupa toda la pantalla.
 */

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { DS } from './tokens';

export function DsFloatingPanel({
  open = true,
  onClose,
  ariaLabel,
  children,
}: {
  open?: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Un diálogo abierto encima (VtDialog, confirmaciones) maneja su propio Esc.
      if (e.key === 'Escape' && document.querySelectorAll('[role="dialog"]').length <= 1) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-ds-floating
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-xl overflow-y-auto overscroll-contain shadow-[0_24px_64px_rgba(0,0,0,.25)] outline-none"
        style={{ background: DS.paper }}
      >
        {children}
      </div>
    </div>
  );
}
