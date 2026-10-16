/**
 * Lógica pura de la navegación del shell (barra lateral de escritorio y barra inferior del teléfono).
 *
 * - `buildNavItems`: los módulos que ve el usuario (los del tipo de negocio activo + IAM
 *   según permisos), con `{businessId}` ya resuelto. Lo usan la barra lateral y el menú de módulos.
 * - `pickBottomBarItems`: qué módulos van como accesos rápidos en la barra inferior del teléfono
 *   (2 a cada lado del logo).
 * - `getInitials` / `resolveActiveProperty`: datos de la propiedad activa para el logo redondo.
 */

import type { SidebarItemConfig } from '../config/business-type-config';

export interface NavItem {
  id: string;
  label: string;
  /** Etiqueta corta para la barra inferior (por defecto `label`). */
  shortLabel: string;
  href: string;
  iconPath: string;
}

export const IAM_NAV_ITEM: NavItem = {
  id: 'iam',
  label: 'IAM',
  shortLabel: 'IAM',
  href: '/iam',
  iconPath:
    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
};

/** Resuelve `{businessId}`: con propiedad activa la sustituye; sin ella (null o 0) quita el segmento. */
export function resolveBusinessHref(href: string, activeBusinessId: number | null): string {
  return activeBusinessId !== null && activeBusinessId !== 0
    ? href.replace('{businessId}', String(activeBusinessId))
    : href.replace('/{businessId}', '');
}

export interface BuildNavItemsInput {
  sidebarItems: readonly SidebarItemConfig[];
  activeBusinessId: number | null;
  canAccessIAM: boolean;
}

/** Módulos navegables, en el mismo orden que la barra lateral: los del tipo, luego IAM. */
export function buildNavItems({ sidebarItems, activeBusinessId, canAccessIAM }: BuildNavItemsInput): NavItem[] {
  const items: NavItem[] = sidebarItems.map((item) => ({
    id: item.id,
    label: item.label,
    shortLabel: item.shortLabel ?? item.label,
    href: resolveBusinessHref(item.href, activeBusinessId),
    iconPath: item.iconPath,
  }));
  if (canAccessIAM) items.push({ ...IAM_NAV_ITEM });
  return items;
}

/**
 * Accesos rápidos de la barra inferior del teléfono, en este orden de preferencia:
 * Inicio (Resumen) y Residentes a la izquierda; Paquetería y Votaciones a la derecha.
 * Son los módulos de uso diario en portería y administración. El resto queda en el menú
 * de módulos (logo central). Si el usuario no tiene alguno, se completa con los demás
 * módulos en el orden de la barra lateral (p. ej. en IAM sin propiedad: solo IAM).
 */
export const BOTTOM_BAR_PREFERRED_IDS = ['resumen', 'residents', 'packages', 'voting-groups'] as const;
export const BOTTOM_BAR_MAX_ITEMS = 4;

export function pickBottomBarItems(
  items: readonly NavItem[],
  preferredIds: readonly string[] = BOTTOM_BAR_PREFERRED_IDS,
  max: number = BOTTOM_BAR_MAX_ITEMS,
): { left: NavItem[]; right: NavItem[] } {
  const chosen: NavItem[] = [];
  for (const id of preferredIds) {
    const item = items.find((i) => i.id === id);
    if (item && !chosen.includes(item)) chosen.push(item);
  }
  for (const item of items) {
    if (chosen.length >= max) break;
    if (!chosen.includes(item)) chosen.push(item);
  }
  const picked = chosen.slice(0, max);
  const half = Math.ceil(picked.length / 2);
  return { left: picked.slice(0, half), right: picked.slice(half) };
}

/** Ruta activa: igual o hija. La raíz de la propiedad (`/properties/7`) solo cuenta si es exacta. */
export function isNavItemActive(href: string, pathname: string, allHrefs: readonly string[] = []): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + '/')) return false;
  // Si otro ítem más específico coincide (p. ej. /properties/7/units frente a /properties/7), gana ese.
  return !allHrefs.some((other) => other !== href && other.startsWith(href + '/') && (pathname === other || pathname.startsWith(other + '/')));
}

const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en']);

/** Iniciales para el logo de respaldo: "Tayazal de Suba" → "TS", "Rupü" → "R", "" → "?". */
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()));
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? [words[0]] : [words[0], words[1]];
  return letters.map((w) => Array.from(w)[0]).join('').toLocaleUpperCase('es');
}

export interface ActiveProperty {
  id: number;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface PropertyLike {
  id: number;
  name: string;
  logo_url?: string;
  primary_color?: string;
}

/** Busca la propiedad activa en una lista (p. ej. `businesses_data` del login). 0/null = ninguna. */
export function resolveActiveProperty(list: readonly PropertyLike[] | null | undefined, activeId: number | null): ActiveProperty | null {
  if (!activeId || !list) return null;
  const found = list.find((b) => b.id === activeId);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    logoUrl: found.logo_url || undefined,
    primaryColor: found.primary_color || undefined,
  };
}
