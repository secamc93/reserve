/**
 * Riel lateral flotante de escritorio (>= md), complemento de `FloatingNav`.
 *
 * Isla blanca delgada fija a la izquierda, alineada con el logo de la barra superior, con los
 * submenús del módulo actual como iconos: los pone `DsSectionHeader` con un portal en el hueco que
 * registra `setSubmenuSlot`, debajo de la marca Rupü (fija, no clickeable). Aparte, "Tutoriales"
 * (videos de cómo usar Rupü) y "Cambiar propiedad" si el usuario tiene dos o más. El contenido
 * deja libre el riel con `md:pl-[84px]`.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setSubmenuSlot } from './nav-slots';

export interface FloatingRailProps {
  onChangeProperty?: () => void;
  /** Si viene, muestra el acceso a Tutoriales (requiere una propiedad elegida). */
  tutorialsHref?: string;
}

const TOOLTIP =
  'pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100';

const ISLAND = 'bg-white border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)]';

export function FloatingRail({ onChangeProperty, tutorialsHref }: FloatingRailProps) {
  const pathname = usePathname() ?? '';
  const onTutorials = !!tutorialsHref && pathname === tutorialsHref;
  return (
    <aside className="hidden md:flex fixed left-4 lg:left-6 top-[84px] bottom-4 z-20 flex-col gap-3 pointer-events-none">
      <div className={`${ISLAND} pointer-events-auto rounded-full p-1.5 flex flex-col items-center`}>
        {/* Marca Rupü: siempre primera, estática (no navega); solo un gesto al pasar el cursor. */}
        <span className="group w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo_rupu.png"
            alt="Rupü"
            draggable={false}
            // El PNG trae mucho margen: se amplía para que la marca llene el círculo.
            className="w-10 h-10 scale-[1.65] select-none transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none group-hover:scale-[1.8] group-hover:-rotate-12"
          />
        </span>
        {/* Submenús del módulo actual: vacío (oculto) hasta que el módulo los ponga. */}
        <div
          ref={setSubmenuSlot}
          className="mt-1.5 pt-1.5 border-t border-[#efedea] empty:hidden"
        />
      </div>

      {tutorialsHref && (
        <div className={`${ISLAND} pointer-events-auto rounded-full p-1.5 flex flex-col items-center`}>
          <Link
            href={tutorialsHref}
            aria-label="Tutoriales"
            aria-current={onTutorials ? 'page' : undefined}
            data-tour="tutorials"
            className={`group relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors ${
              onTutorials ? 'text-white shadow-sm' : 'text-[#6b6a66] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
            }`}
            style={onTutorials ? { backgroundColor: 'var(--color-primary)' } : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span aria-hidden="true" className={TOOLTIP}>Tutoriales</span>
          </Link>
        </div>
      )}

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
