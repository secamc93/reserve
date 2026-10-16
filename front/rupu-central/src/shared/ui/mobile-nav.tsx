/**
 * Navegación del shell en teléfono (< 768 px, `md` de Tailwind; en escritorio no se muestra).
 *
 * - Barra inferior fija con el color primario de la propiedad: 2 accesos rápidos a cada lado
 *   (ver `pickBottomBarItems`) y en el centro el logo redondo de la propiedad activa.
 * - El logo abre el "Menú de módulos" (hoja inferior): nombre de la propiedad, usuario y rol,
 *   grilla con todos los módulos, `sheetExtra`, "Mi perfil",
 *   "Cambiar propiedad" (solo si el usuario tiene dos o más) y "Cerrar sesión". Se cierra al navegar.
 */

'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottomSheet } from './bottom-sheet';
import { PropertyLogo } from './property-logo';
import { isNavItemActive, pickBottomBarItems, type ActiveProperty, type NavItem } from '../utils/navigation';

export interface MobileNavUser {
  name: string;
  email: string;
  role?: string;
  is_super_admin?: boolean;
}

export interface MobileNavProps {
  items: NavItem[];
  property: ActiveProperty | null;
  /** Nombre a mostrar si no hay propiedad activa (p. ej. en IAM del super admin). */
  fallbackName?: string;
  user: MobileNavUser;
  onLogout: () => void;
  /** Si viene, muestra "Cambiar propiedad" (el usuario tiene dos o más propiedades). */
  onChangeProperty?: () => void;
  onOpenProfile?: () => void;
  /** Contenido adicional dentro del menú (p. ej. el selector de propiedad). */
  sheetExtra?: ReactNode;
}

function NavIcon({ d, className = 'h-6 w-6' }: { d: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export function MobileNav({
  items,
  property,
  fallbackName = 'Rupü',
  user,
  onLogout,
  onChangeProperty,
  onOpenProfile,
  sheetExtra,
}: MobileNavProps) {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const logoRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();
  const name = property?.name ?? fallbackName;
  const hrefs = items.map((i) => i.href);
  const { left, right } = pickBottomBarItems(items);

  // Al navegar (cambia la ruta) el menú se cierra.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  const renderBarItem = (item: NavItem) => {
    const active = isNavItemActive(item.href, pathname, hrefs);
    return (
      <li key={item.id} className="flex min-w-0 justify-center">
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={`flex w-full min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            active ? 'bg-white/20 text-white' : 'text-white/75 hover:text-white'
          }`}
        >
          <NavIcon d={item.iconPath} className="h-6 w-6" />
          <span className="max-w-full truncate">{item.shortLabel}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      <nav
        aria-label="Navegación inferior"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] md:hidden"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center gap-1 px-2">
          {left.map(renderBarItem)}
          {/* Rellenar si hay menos de 2 accesos a la izquierda para centrar el logo. */}
          {Array.from({ length: 2 - left.length }, (_, i) => <li key={`l${i}`} aria-hidden="true" />)}
          <li className="flex justify-center">
            <button
              ref={logoRef}
              type="button"
              aria-label="Abrir menú de módulos"
              aria-expanded={open}
              aria-controls={open ? sheetId : undefined}
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
              className="-mt-7 rounded-full p-1 shadow-lg transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 active:scale-95"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <PropertyLogo name={name} logoUrl={property?.logoUrl} size={60} className="ring-2 ring-white" />
            </button>
          </li>
          {right.map(renderBarItem)}
          {Array.from({ length: 2 - right.length }, (_, i) => <li key={`r${i}`} aria-hidden="true" />)}
        </ul>
      </nav>

      <BottomSheet
        id={sheetId}
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Menú de módulos"
        returnFocusRef={logoRef}
        headerClassName="text-white"
        headerStyle={{ backgroundColor: 'var(--color-primary)' }}
        header={
          <div className="flex items-center gap-3">
            <PropertyLogo name={name} logoUrl={property?.logoUrl} size={48} />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{name}</p>
              <p className="truncate text-sm text-white/80">
                {user.name}
                {user.role ? ` · ${user.role}` : ''}
              </p>
              {user.is_super_admin && (
                <span className="mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Super admin
                </span>
              )}
            </div>
          </div>
        }
        footer={
          <div className={`grid gap-1 p-2 ${['grid-cols-1', 'grid-cols-2', 'grid-cols-3'][(onOpenProfile ? 1 : 0) + (onChangeProperty ? 1 : 0)]}`}>
            {onOpenProfile && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenProfile();
                }}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                <NavIcon className="h-5 w-5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                Mi perfil
              </button>
            )}
            {onChangeProperty && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onChangeProperty();
              }}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              <NavIcon className="h-5 w-5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              Cambiar propiedad
            </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <NavIcon className="h-5 w-5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              Cerrar sesión
            </button>
          </div>
        }
      >
        <nav aria-label="Módulos" className="p-4">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">Selecciona una propiedad para ver sus módulos.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3">
              {items.map((item) => {
                const active = isNavItemActive(item.href, pathname, hrefs);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      // No se cierra aquí: desmontar el Link durante el clic cancela la navegación de
                      // Next. Se cierra al cambiar la ruta; si es la página actual, se cierra ya.
                      onClick={() => { if (item.href === pathname) setOpen(false); }}
                      aria-current={active ? 'page' : undefined}
                      className={`flex h-full flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-medium text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                        active ? 'border-[var(--color-primary)] bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        <NavIcon d={item.iconPath} className="h-5 w-5" />
                      </span>
                      <span className="leading-tight">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {sheetExtra && <div className="mt-4 border-t border-gray-200 pt-4">{sheetExtra}</div>}
        </nav>
      </BottomSheet>
    </>
  );
}
