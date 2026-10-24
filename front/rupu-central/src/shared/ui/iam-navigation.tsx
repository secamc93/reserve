/**
 * Cabecera y pestañas de Accesos (IAM), rediseño "IAM - Rediseño" 2a–2d.
 *
 * Cinco pestañas: Resumen · Usuarios · Roles y permisos · Propiedades · Avanzado. "Avanzado"
 * agrupa las pantallas técnicas (permisos sueltos, recursos y tipos de negocio), que se eligen
 * con píldoras debajo de las pestañas.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { dsFontRoot, dsMono } from './ds/fonts';

interface IamTab {
  href: string;
  label: string;
  /** Rutas que marcan la pestaña como activa (en vez de `href`). */
  match?: string[];
}

const ADVANCED: IamTab[] = [
  { href: '/iam/permissions', label: 'Permisos' },
  { href: '/iam/resources', label: 'Recursos' },
  { href: '/iam/business-types', label: 'Tipos de negocio' },
];

const TABS: IamTab[] = [
  { href: '/iam', label: 'Resumen' },
  { href: '/iam/users', label: 'Usuarios' },
  { href: '/iam/roles', label: 'Roles y permisos' },
  { href: '/iam/businesses', label: 'Propiedades' },
  { href: '/iam/permissions', label: 'Avanzado', match: ADVANCED.map((t) => t.href) },
];

/** ¿La ruta pertenece a la pestaña? `/iam` solo coincide exacto; las demás, también con subrutas. */
export function isIamTabActive(pathname: string, tab: { href: string; match?: string[] }): boolean {
  const prefixes = tab.match ?? [tab.href];
  return prefixes.some((p) => (p === '/iam' ? pathname === p : pathname === p || pathname.startsWith(`${p}/`)));
}

export function IAMNavigation({ counts }: { counts?: Partial<Record<string, number | null>> }) {
  const pathname = usePathname() ?? '';
  const inAdvanced = isIamTabActive(pathname, TABS[TABS.length - 1]);

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Secciones de accesos" className="flex gap-1 border-b border-[#e4e2dd] overflow-x-auto -mx-1 px-1">
        {TABS.map((tab) => {
          const on = isIamTabActive(pathname, tab);
          const count = counts?.[tab.href];
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={on ? 'page' : undefined}
              className={`px-3.5 py-3 text-sm whitespace-nowrap -mb-px border-b-2 transition-colors ${
                on ? 'font-semibold text-[#1a1a1a] border-[#0F7F8A]' : 'font-medium text-[#4b4a46] border-transparent hover:text-[#1a1a1a]'
              }`}
            >
              {tab.label}
              {count !== undefined && count !== null && <span className={`${dsMono} ml-1.5 text-xs text-[#6b6660]`}>{count}</span>}
            </Link>
          );
        })}
      </nav>
      {inAdvanced && (
        <nav aria-label="Avanzado" className="flex flex-wrap gap-1">
          {ADVANCED.map((tab) => {
            const on = isIamTabActive(pathname, tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={on ? 'page' : undefined}
                className={`h-8 max-md:h-10 px-3.5 rounded-full text-xs font-medium inline-flex items-center whitespace-nowrap transition-colors ${
                  on ? 'bg-[#1a1a1a] text-white' : 'text-[#4b4a46] hover:bg-white hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/** Cabecera de una pantalla de Accesos: rótulo, título, descripción, acciones y pestañas. */
export function IamPageHeader({
  title,
  description,
  actions,
  counts,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Conteo junto a una pestaña, por su ruta (`{ '/iam/users': 48 }`). */
  counts?: Partial<Record<string, number | null>>;
}) {
  return (
    <header className={`${dsFontRoot} flex flex-col gap-5 text-[#1a1a1a]`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs font-semibold tracking-[.08em] uppercase text-[#0F7F8A]">Accesos</span>
          <h1 className="m-0 text-2xl md:text-[28px] font-bold tracking-[-.01em]">{title}</h1>
          {description && <p className="m-0 text-sm text-[#4b4a46]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2.5 max-md:w-full max-md:[&>*]:flex-1">{actions}</div>}
      </div>
      <IAMNavigation counts={counts} />
    </header>
  );
}

/** Contenedor de una pantalla de Accesos: fondo papel, márgenes y ancho máximo. */
export function IamPage({ children }: { children: ReactNode }) {
  return (
    <div className={`${dsFontRoot} min-h-full bg-[#f5f5f4] text-[#1a1a1a] px-4 md:px-8 pt-5 md:pt-7 pb-12`}>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-5">{children}</div>
    </div>
  );
}
