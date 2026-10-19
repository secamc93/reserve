/**
 * Barra de navegación flotante de escritorio (>= md; en teléfono se usa `MobileNav`).
 *
 * Tres "islas" blancas sobre el fondo papel, fijas arriba al hacer scroll:
 * - Izquierda: logo y nombre de la propiedad activa ("Cambiar propiedad" está en `FloatingRail`).
 * - Centro: píldora con los módulos principales (ver `splitPillItems`); el activo se rellena con
 *   el color primario de la propiedad. El resto va al menú "Más", que muestra el nombre del
 *   módulo cuando el activo está ahí.
 * - Derecha: etiqueta de super admin, usuario (abre el perfil) y cerrar sesión.
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropertyLogo } from './property-logo';
import { isNavItemActive, splitPillItems, type ActiveProperty, type NavItem } from '../utils/navigation';

export interface FloatingNavUser {
  name: string;
  email: string;
  avatarUrl?: string;
  is_super_admin?: boolean;
}

export interface FloatingNavProps {
  items: NavItem[];
  property: ActiveProperty | null;
  /** Nombre a mostrar si no hay propiedad activa (p. ej. en IAM del super admin). */
  fallbackName?: string;
  user: FloatingNavUser;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

const ISLAND = 'bg-white border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)]';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function FloatingNav({ items, property, fallbackName, user, onLogout, onOpenProfile }: FloatingNavProps) {
  const pathname = usePathname() ?? '';
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreMenuId = useId();

  const { primary, overflow } = splitPillItems(items);
  const allHrefs = items.map((i) => i.href);
  const isActive = (item: NavItem) => isNavItemActive(item.href, pathname, allHrefs);
  const activeOverflow = overflow.find(isActive);
  const propertyName = property?.name || fallbackName || 'Rupü';

  // El menú "Más" se cierra al navegar, con Escape y al hacer clic fuera.
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const pillClass = (active: boolean) =>
    `h-9 px-4 rounded-full text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
      active ? 'text-white font-semibold shadow-sm' : 'text-[#4b4a46] font-medium hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
    }`;
  const activeStyle = { backgroundColor: 'var(--color-primary)' };

  return (
    <header className="hidden md:block sticky top-0 z-30 px-4 lg:px-6 pt-3 pb-2 bg-[#f5f5f4]/85 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Propiedad activa */}
        <div className={`${ISLAND} rounded-full h-[52px] pl-1.5 pr-1.5 lg:pr-4 flex items-center gap-2.5 min-w-0 flex-shrink-0`}>
          <PropertyLogo name={propertyName} logoUrl={property?.logoUrl} size={40} />
          <div className="hidden lg:block min-w-0 max-w-[180px]">
            <p className="text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">{propertyName}</p>
            <p className="text-[11px] text-[#8a8580] truncate leading-tight">{property ? 'Propiedad horizontal' : 'Elige una propiedad'}</p>
          </div>
        </div>

        {/* Módulos */}
        {/* Mientras cargan los permisos no hay módulos: no se muestra una píldora vacía. */}
        <div className="flex-1 min-w-0 flex justify-center">
          {items.length > 0 && (
          <nav aria-label="Navegación principal" className={`${ISLAND} rounded-full h-[52px] p-[7px] flex items-center gap-0.5`}>
            {primary.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={pillClass(active)}
                  style={active ? activeStyle : undefined}
                >
                  {item.label}
                </Link>
              );
            })}

            {overflow.length > 0 && (
              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={moreOpen}
                  aria-controls={moreMenuId}
                  onClick={() => setMoreOpen((open) => !open)}
                  className={pillClass(!!activeOverflow)}
                  style={activeOverflow ? activeStyle : undefined}
                >
                  {activeOverflow ? activeOverflow.label : 'Más'}
                  <Icon d="M19 9l-7 7-7-7" className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div
                    id={moreMenuId}
                    role="group"
                    aria-label="Más módulos"
                    className={`${ISLAND} absolute right-0 top-[calc(100%+12px)] w-56 rounded-2xl p-1.5`}
                  >
                    {overflow.map((item) => {
                      const active = isActive(item);
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] transition-colors ${
                            active ? 'font-semibold text-[#1a1a1a] bg-[#f5f5f4]' : 'text-[#4b4a46] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
                          }`}
                        >
                          <span style={active ? { color: 'var(--color-primary)' } : undefined}>
                            <Icon d={item.iconPath} />
                          </span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
          )}
        </div>

        {/* Usuario */}
        <div className={`${ISLAND} rounded-full h-[52px] pl-1.5 pr-1.5 flex items-center gap-1 flex-shrink-0`}>
          <button
            type="button"
            onClick={onOpenProfile}
            title={user.name}
            aria-label={`Perfil de ${user.name}`}
            className="flex items-center gap-2.5 rounded-full pr-2 hover:bg-[#f5f5f4] transition-colors text-left"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden lg:block min-w-0 max-w-[170px]">
              <span className="flex items-center gap-1.5">
                <span className="block text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">{user.name}</span>
                {user.is_super_admin && (
                  <span className="px-1.5 py-px rounded-full text-[9px] font-bold tracking-wide bg-purple-600 text-white flex-shrink-0">SUPER ADMIN</span>
                )}
              </span>
              <span className="block text-[11px] text-[#8a8580] truncate leading-tight">{user.email}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#8a8580] hover:bg-[#f5f5f4] hover:text-[#1a1a1a] transition-colors"
          >
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </button>
        </div>
      </div>
    </header>
  );
}
