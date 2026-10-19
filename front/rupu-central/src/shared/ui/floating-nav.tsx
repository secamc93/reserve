/**
 * Barra de navegación flotante de escritorio (>= md; en teléfono se usa `MobileNav`).
 *
 * Tres "islas" blancas sobre el fondo papel, fijas arriba al hacer scroll:
 * - Izquierda: logo y nombre de la propiedad activa ("Cambiar propiedad" está en `FloatingRail`).
 * - Centro: hueco para las pestañas del módulo actual (`DsSectionHeader` las lleva ahí con un
 *   portal, ver `top-bar-slot`). Los módulos están en `FloatingRail`.
 * - Derecha: etiqueta de super admin, usuario (abre el perfil) y cerrar sesión.
 */

'use client';

import { PropertyLogo } from './property-logo';
import { setTopBarSlot } from './top-bar-slot';
import type { ActiveProperty } from '../utils/navigation';

export interface FloatingNavUser {
  name: string;
  email: string;
  avatarUrl?: string;
  is_super_admin?: boolean;
}

export interface FloatingNavProps {
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

export function FloatingNav({ property, fallbackName, user, onLogout, onOpenProfile }: FloatingNavProps) {
  const propertyName = property?.name || fallbackName || 'Rupü';

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

        {/* Pestañas del módulo actual (las pone `DsSectionHeader`). */}
        <div ref={setTopBarSlot} className="flex-1 min-w-0 flex justify-center" />

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
