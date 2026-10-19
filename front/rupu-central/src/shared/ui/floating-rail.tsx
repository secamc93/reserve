/**
 * Riel lateral flotante de escritorio (>= md), complemento de `FloatingNav`.
 *
 * Isla blanca delgada fija a la izquierda, alineada con el logo de la barra superior: todos los
 * módulos como iconos (el nombre aparece al pasar el mouse o con el foco) y, aparte, "Cambiar
 * propiedad" si el usuario tiene dos o más. El activo se rellena con el color primario de la
 * propiedad. El contenido de la página deja su ancho libre con `md:pl-[84px]`.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavItemActive, type NavItem } from '../utils/navigation';

export interface FloatingRailProps {
  items: NavItem[];
  onChangeProperty?: () => void;
}

const ISLAND = 'bg-white border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)]';

function RailIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

/** Nombre del módulo a la derecha del icono, visible al pasar el mouse o con el foco del teclado. */
function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

const buttonClass = (active: boolean) =>
  `group relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors ${
    active ? 'text-white shadow-sm' : 'text-[#6b6a66] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
  }`;

export function FloatingRail({ items, onChangeProperty }: FloatingRailProps) {
  const pathname = usePathname() ?? '';
  const allHrefs = items.map((i) => i.href);

  if (items.length === 0 && !onChangeProperty) return null;

  return (
    <aside className="hidden md:flex fixed left-4 lg:left-6 top-[84px] bottom-4 z-20 flex-col gap-3 pointer-events-none">
      {items.length > 0 && (
        <nav aria-label="Módulos" className={`${ISLAND} pointer-events-auto rounded-full p-1.5 flex flex-col items-center gap-1`}>
          {items.map((item) => {
            const active = isNavItemActive(item.href, pathname, allHrefs);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={buttonClass(active)}
                style={active ? { backgroundColor: 'var(--color-primary)' } : undefined}
              >
                <RailIcon d={item.iconPath} />
                <Tooltip label={item.label} />
              </Link>
            );
          })}
        </nav>
      )}

      {onChangeProperty && (
        <div className={`${ISLAND} pointer-events-auto rounded-full p-1.5 flex flex-col items-center`}>
          <button type="button" onClick={onChangeProperty} aria-label="Cambiar propiedad" className={buttonClass(false)}>
            <RailIcon d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            <Tooltip label="Cambiar propiedad" />
          </button>
        </div>
      )}
    </aside>
  );
}
