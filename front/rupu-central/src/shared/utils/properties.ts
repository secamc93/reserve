/**
 * Lógica pura de las propiedades horizontales a las que accede el usuario.
 * El producto es solo de propiedad horizontal: no hay selector de módulo (tipo de negocio).
 * - Super admin: accede a todas las propiedades.
 * - Demás usuarios: a las de su login (`businesses_data`), que pueden ser varias.
 */

export const HORIZONTAL_PROPERTY_TYPE = 'horizontal_property';

export interface PropertyOption {
  id: number;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
}

interface BusinessLike {
  id: number;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  business_type_code?: string;
  is_active?: boolean;
}

/** Convierte negocios (login o API) en propiedades, sin los de otro tipo ni los inactivos. */
export function toPropertyOptions(businesses: readonly BusinessLike[] | null | undefined): PropertyOption[] {
  return (businesses ?? [])
    .filter((b) => (!b.business_type_code || b.business_type_code === HORIZONTAL_PROPERTY_TYPE) && b.is_active !== false)
    .map((b) => ({
      id: b.id,
      name: b.name,
      logoUrl: b.logo_url,
      primaryColor: b.primary_color,
      secondaryColor: b.secondary_color,
      tertiaryColor: b.tertiary_color,
      quaternaryColor: b.quaternary_color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/** "Cambiar propiedad" solo tiene sentido con dos o más propiedades. */
export const canSwitchProperty = (properties: readonly PropertyOption[]) => properties.length >= 2;

/**
 * A dónde ir después del login: con una sola propiedad, directo a ella; con varias (o super
 * admin, que ve todas), al selector de propiedades; sin propiedades, a /home.
 */
export function loginDestination(input: { isSuperAdmin: boolean; propertyIds: readonly number[] }):
  | { kind: 'property'; id: number; href: string }
  | { kind: 'picker'; href: string }
  | { kind: 'none'; href: string } {
  if (input.isSuperAdmin || input.propertyIds.length > 1) return { kind: 'picker', href: '/properties' };
  if (input.propertyIds.length === 1) {
    const id = input.propertyIds[0];
    return { kind: 'property', id, href: `/properties/${id}` };
  }
  return { kind: 'none', href: '/home' };
}

/** Hay una propiedad elegida (el super admin sin elegir queda con 0). */
export const hasActiveProperty = (activeId: number | null | undefined): activeId is number =>
  typeof activeId === 'number' && activeId > 0;

/** Ruta del selector de propiedad. */
export const PROPERTY_PICKER_PATH = '/properties';

/**
 * Sin propiedad elegida solo se puede estar en el selector: el resto de páginas de la propiedad
 * (y su menú) no tienen sentido sin ella.
 */
export function mustPickProperty(pathname: string, activeId: number | null | undefined): boolean {
  return !hasActiveProperty(activeId) && pathname !== PROPERTY_PICKER_PATH;
}
