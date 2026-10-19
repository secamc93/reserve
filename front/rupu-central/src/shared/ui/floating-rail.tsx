/**
 * Riel lateral flotante de escritorio (>= md), complemento de `FloatingNav`.
 *
 * Isla blanca delgada fija a la izquierda, alineada con el logo de la barra superior, con los
 * submenús del módulo actual como iconos: los pone `DsSectionHeader` con un portal en el hueco que
 * registra `setSubmenuSlot`. Si el módulo no tiene submenús, la isla no se ve. Aparte, "Cambiar
 * propiedad" si el usuario tiene dos o más. El contenido deja libre el riel con `md:pl-[84px]`.
 */

'use client';

import { setSubmenuSlot } from './nav-slots';

export interface FloatingRailProps {
  onChangeProperty?: () => void;
}

const ISLAND = 'bg-white border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)]';

export function FloatingRail({ onChangeProperty }: FloatingRailProps) {
  return (
    <aside className="hidden md:flex fixed left-4 lg:left-6 top-[84px] bottom-4 z-20 flex-col gap-3 pointer-events-none">
      {/* Submenús del módulo actual: vacía (oculta) hasta que el módulo los ponga. */}
      <div
        ref={setSubmenuSlot}
        className={`${ISLAND} pointer-events-auto rounded-full p-1.5 empty:hidden`}
      />

      {onChangeProperty && (
        <div className={`${ISLAND} pointer-events-auto rounded-full p-1.5 flex flex-col items-center`}>
          <button
            type="button"
            onClick={onChangeProperty}
            aria-label="Cambiar propiedad"
            className="group relative w-10 h-10 rounded-full inline-flex items-center justify-center text-[#6b6a66] hover:bg-[#f5f5f4] hover:text-[#1a1a1a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Cambiar propiedad
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
