/**
 * Barra de navegación flotante de escritorio (>= md; en teléfono se usa `MobileNav`).
 *
 * Islas blancas sobre el fondo papel, fijas arriba al hacer scroll:
 * - Izquierda: el logo de la propiedad activa es un desplegable. Cerrado muestra el nombre y el
 *   módulo actual; abierto se expande a la derecha con los módulos como iconos (nombre al pasar
 *   el mouse). Al elegir uno se cierra; sus submenús aparecen en `FloatingRail`.
 * - Derecha: etiqueta de super admin, usuario (abre el perfil) y cerrar sesión.
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropertyLogo } from './property-logo';
import { isNavItemActive, type ActiveProperty, type NavItem } from '../utils/navigation';

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
const TOOLTIP =
  'pointer-events-none absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function FloatingNav({ items, property, fallbackName, user, onLogout, onOpenProfile }: FloatingNavProps) {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const modulesId = useId();

  const allHrefs = items.map((i) => i.href);
  const isActive = (item: NavItem) => isNavItemActive(item.href, pathname, allHrefs);
  const current = items.find(isActive);
  const propertyName = property?.name || fallbackName || 'Rupü';

  // Se cierra al navegar (elegir un módulo), con Escape y al hacer clic fuera.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (launcherRef.current && !launcherRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="hidden md:block sticky top-0 z-30 px-4 lg:px-6 pt-3 pb-2 bg-[#f5f5f4]/85 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Propiedad + desplegable de módulos */}
        <div ref={launcherRef} className={`${ISLAND} rounded-full h-[52px] pl-1.5 pr-1.5 flex items-center gap-1 min-w-0`}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={modulesId}
            aria-label={open ? 'Cerrar módulos' : `Módulos de ${propertyName}`}
            title={propertyName}
            className="flex items-center gap-2.5 rounded-full pr-2 hover:bg-[#f5f5f4] transition-colors text-left min-w-0"
          >
            <PropertyLogo name={propertyName} logoUrl={property?.logoUrl} size={40} />
            {!open && (
              <span className="hidden lg:block min-w-0 max-w-[180px]">
                <span className="block text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">{propertyName}</span>
                <span className="block text-[11px] text-[#8a8580] truncate leading-tight">
                  {current ? current.label : property ? 'Propiedad horizontal' : 'Elige una propiedad'}
                </span>
              </span>
            )}
            <Icon d={open ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} className="w-3.5 h-3.5 text-[#8a8580]" />
          </button>

          {open && (
            <nav id={modulesId} aria-label="Módulos" className="flex items-center gap-1 pl-1 border-l border-[#e4e2dd]">
              {items.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`group relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors ${
                      active ? 'text-white shadow-sm' : 'text-[#6b6a66] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
                    }`}
                    style={active ? { backgroundColor: 'var(--color-primary)' } : undefined}
                  >
                    <Icon d={item.iconPath} className="w-5 h-5" />
                    <span aria-hidden="true" className={TOOLTIP}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex-1" />

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
