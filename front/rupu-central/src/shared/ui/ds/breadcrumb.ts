/**
 * Miga de pan de la barra superior: "<propiedad> / <módulo>" dentro de un módulo y
 * "Propiedad horizontal / <propiedad>" en el resumen (diseño "PH - Shell y Resumen").
 */

const MODULE_LABELS: Record<string, string> = {
  units: 'Unidades',
  residents: 'Residentes',
  visits: 'Visitas',
  packages: 'Paquetería',
  'common-areas': 'Zonas comunes',
  parking: 'Parqueaderos',
  'voting-groups': 'Votaciones',
};

export interface Crumbs {
  parent: string;
  current: string;
}

export function breadcrumbFor(pathname: string, propertyName?: string | null): Crumbs {
  const name = propertyName?.trim() || 'Propiedad';
  const parts = pathname.split('/').filter(Boolean); // ["properties", ":id", "parking", ...]
  if (parts[0] !== 'properties' || parts.length < 2) return { parent: 'Propiedad horizontal', current: 'Elegir propiedad' };
  const module = parts[2];
  if (!module) return { parent: 'Propiedad horizontal', current: name };
  return { parent: name, current: MODULE_LABELS[module] ?? module };
}
