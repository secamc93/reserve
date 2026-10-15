/**
 * Hoja inferior (bottom sheet) accesible para teléfono.
 *
 * - `role="dialog"` + `aria-modal`, con nombre por `title` (visible) o `ariaLabel`.
 * - Cierra con: tocar el fondo, la tecla Esc, el botón "Cerrar" y deslizar hacia abajo desde la
 *   manija (más de 80 px).
 * - Atrapa el foco mientras está abierta y lo devuelve al elemento que la abrió (o a
 *   `returnFocusRef`) al cerrar. Bloquea el scroll del body.
 * - Sube con animación (`.sheet-panel` en globals.css), desactivada con prefers-reduced-motion.
 */

'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Título visible del encabezado; también es el nombre accesible del diálogo. */
  title?: ReactNode;
  /** Nombre accesible si no hay `title` de texto. */
  ariaLabel?: string;
  /** Contenido extra del encabezado (debajo del título). */
  header?: ReactNode;
  children: ReactNode;
  /** Pie fijo de la hoja (acciones). */
  footer?: ReactNode;
  /** Elemento al que vuelve el foco al cerrar (por defecto, el que tenía el foco al abrir). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Estilo del encabezado (p. ej. fondo con el color de la propiedad). */
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
  id?: string;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SWIPE_CLOSE_PX = 80;

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  header,
  children,
  footer,
  returnFocusRef,
  headerClassName = 'bg-white text-gray-900',
  headerStyle,
  id,
  className = '',
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  // Foco: entra al abrir, queda atrapado, vuelve al cerrar. Esc cierra.
  useEffect(() => {
    if (!open) return;
    const previous = (returnFocusRef?.current ?? document.activeElement) as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === firstNode || !panel.contains(document.activeElement))) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && (document.activeElement === lastNode || !panel.contains(document.activeElement))) {
        e.preventDefault();
        firstNode.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      setDragY(0);
      // Devolver el foco a quien abrió (si sigue en el documento).
      const target = returnFocusRef?.current ?? previous;
      if (target && document.contains(target)) target.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - dragStart.current));
  };
  const onTouchEnd = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > SWIPE_CLOSE_PX) onClose();
    else setDragY(0);
  };

  return (
    <div className="fixed inset-0 z-50" id={id}>
      <div className="sheet-backdrop absolute inset-0 bg-black/50" onClick={onClose} data-testid="bottom-sheet-backdrop" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={`sheet-panel absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl focus:outline-none ${className}`}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          className={`shrink-0 ${headerClassName}`}
          style={headerStyle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
            <span className="h-1.5 w-10 rounded-full bg-current opacity-30" />
          </div>
          <div className="flex items-start gap-3 px-5 pb-4 pt-1">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="truncate text-lg font-bold">
                  {title}
                </h2>
              )}
              {header}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">{footer}</div>}
      </div>
    </div>
  );
}
