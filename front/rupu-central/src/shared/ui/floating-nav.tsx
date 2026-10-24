/**
 * Barra de navegación flotante de escritorio (>= md; en teléfono se usa `MobileNav`).
 *
 * Islas blancas sobre el fondo papel, fijas arriba al hacer scroll:
 * - Izquierda: el logo de la propiedad activa es un desplegable que se abre al pasar el cursor
 *   (o con clic / teclado). Cerrado muestra el icono del módulo actual, el nombre de la propiedad
 *   y el del módulo; abierto se expande a la derecha con los módulos como iconos (nombre al pasar
 *   el mouse). Al elegir uno se cierra; sus submenús aparecen en `FloatingRail`.
 * - Derecha: los botones del módulo actual (los pone `DsSectionHeader` en el hueco `actions`),
 *   etiqueta de super admin, usuario (abre el perfil) y cerrar sesión.
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropertyLogo } from './property-logo';
import { setActionsSlot } from './nav-slots';
import { isNavItemActive, type ActiveProperty, type NavItem } from '../utils/navigation';
import { buildBreadcrumbs } from '../utils/breadcrumbs';

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
/** Curva suave (sale rápido y frena al final); sin animación si el sistema pide menos movimiento. */
const EASE = 'ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none';
/** El despliegue tarda 500 ms; el retroceso, más pausado, 800 ms. */
const DURATION = (open: boolean) => (open ? 'duration-500' : 'duration-[800ms]');
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
  // Abierto y terminado de desplegar: ya no recorta (los nombres se ven debajo de los iconos).
  const [settled, setSettled] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modulesId = useId();

  // Con el cursor: abre al entrar y cierra al salir, con una pausa corta para que no se cierre al
  // rozar el borde sin querer.
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openOnHover = () => {
    cancelClose();
    setOpen(true);
  };
  const closeOnLeave = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };
  useEffect(() => cancelClose, []);

  const allHrefs = items.map((i) => i.href);
  const isActive = (item: NavItem) => isNavItemActive(item.href, pathname, allHrefs);
  const current = items.find(isActive);
  const propertyName = property?.name || fallbackName || 'Rupü';
  const crumbs = buildBreadcrumbs(pathname, { propertyName: property?.name, modules: items });

  useEffect(() => {
    if (!open) setSettled(false);
  }, [open]);

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
        <div
          ref={launcherRef}
          onMouseEnter={openOnHover}
          onMouseLeave={closeOnLeave}
          className={`${ISLAND} rounded-full h-[52px] pl-1.5 pr-1.5 flex items-center min-w-0 flex-shrink-0`}
        >
          <button
            type="button"
            // Con el cursor ya está abierto al hacer clic: el clic solo abre (táctil / teclado).
            onClick={openOnHover}
            aria-expanded={open}
            aria-controls={modulesId}
            aria-label={`Módulos de ${propertyName}`}
            title={propertyName}
            className="flex items-center rounded-full pr-2 hover:bg-[#f5f5f4] transition-colors text-left min-w-0"
          >
            <PropertyLogo name={propertyName} logoUrl={property?.logoUrl} size={40} />
            {/* Módulo actual y nombre: se recogen al abrir. */}
            <span
              className={`flex items-center gap-2.5 overflow-hidden ${EASE} transition-[max-width,opacity,margin] ${DURATION(open)} ${
                open ? 'max-w-0 opacity-0 ml-0' : 'max-w-[300px] opacity-100 ml-2.5'
              }`}
            >
              {current && (
                <span
                  data-testid="current-module"
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Icon d={current.iconPath} className="w-[18px] h-[18px]" />
                </span>
              )}
              <span className="hidden xl:block min-w-0 max-w-[180px]">
                <span className="block text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">{propertyName}</span>
                <span className="block text-[11px] text-[#8a8580] truncate leading-tight">
                  {current ? current.label : property ? 'Propiedad horizontal' : 'Elige una propiedad'}
                </span>
              </span>
            </span>
            <Icon
              d="M9 5l7 7-7 7"
              className={`w-3.5 h-3.5 ml-2 text-[#8a8580] ${EASE} transition-transform ${DURATION(open)} ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {items.length > 0 && (
            <nav
              id={modulesId}
              aria-label="Módulos"
              aria-hidden={!open}
              inert={!open}
              onTransitionEnd={(e) => {
                if (open && e.target === e.currentTarget && e.propertyName === 'max-width') setSettled(true);
              }}
              // Mientras se despliega recorta; ya abierto deja ver los nombres (tooltips) debajo.
              className={`flex items-center gap-1 ${EASE} transition-[max-width,opacity,padding,border-color] ${DURATION(open)} border-l ${
                open ? 'opacity-100 pl-1 border-[#e4e2dd]' : 'opacity-0 pl-0 border-transparent'
              } ${open && settled ? 'overflow-visible' : 'overflow-hidden'}`}
              // Ancho exacto (iconos de 40 px + 4 px de separación + borde): se abre a ritmo parejo.
              style={{ maxWidth: open ? items.length * 44 + 1 : 0 }}
            >
              {items.map((item, index) => {
                const active = isActive(item);
                return (
                  <span
                    key={item.id}
                    // Al abrir entran uno tras otro desde el logo; al cerrar salen en orden inverso.
                    className={`${EASE} transition-[opacity,transform] duration-500 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
                    style={{ transitionDelay: `${open ? 120 + index * 45 : (items.length - 1 - index) * 40}ms` }}
                  >
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={`group relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors duration-200 ${
                        active ? 'text-white shadow-sm' : 'text-[#6b6a66] hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
                      }`}
                      style={active ? { backgroundColor: 'var(--color-primary)' } : undefined}
                    >
                      <Icon d={item.iconPath} className="w-5 h-5" />
                      <span aria-hidden="true" className={TOOLTIP}>{item.label}</span>
                    </Link>
                  </span>
                );
              })}
            </nav>
          )}
        </div>

        {/* Ruta: dónde estoy (propiedad › módulo › …); cada paso vuelve a su pantalla. */}
        {crumbs.length > 1 && (
          <nav
            aria-label="Ruta"
            className={`${ISLAND} hidden lg:flex rounded-full h-[44px] px-4 items-center min-w-0 max-w-[48%] transition-opacity duration-300 ${open ? 'invisible opacity-0' : ''}`}
          >
            <ol className="flex items-center gap-1.5 min-w-0 text-[13px]">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <Icon d="M9 5l7 7-7 7" className="w-3 h-3 text-[#b5b0aa] flex-shrink-0" />}
                  {c.href ? (
                    <Link href={c.href} className="truncate text-[#6b6a66] hover:text-[#1a1a1a] hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="truncate font-semibold text-[#1a1a1a]">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Botones del módulo actual (los pone `DsSectionHeader`). */}
        {/* Por debajo de xl no caben junto a los módulos abiertos: se ocultan mientras tanto. */}
        <div
          ref={setActionsSlot}
          className={`flex-1 min-w-0 flex items-center justify-end whitespace-nowrap transition-opacity duration-300 ${open ? 'max-xl:invisible max-xl:opacity-0' : ''}`}
        />

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
            <span className="hidden xl:block min-w-0 max-w-[170px]">
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
