/**
 * Ruta de la pantalla actual ("dónde estoy"), armada desde la URL: propiedad › módulo › …
 * Cada paso, menos el último, enlaza a su pantalla para volver.
 */

export interface Crumb {
  label: string;
  /** Sin href: es la pantalla actual o un paso sin pantalla propia. */
  href?: string;
}

/** Nombres de los segmentos fijos de la URL que no son módulos del menú. */
const SEGMENT_LABELS: Record<string, string> = {
  tutorials: 'Tutoriales',
  reservations: 'Reservas',
  plans: 'Planes',
  attendance: 'Asistencia',
  live: 'En vivo',
  create: 'Nuevo',
  users: 'Usuarios',
  roles: 'Roles',
  permissions: 'Permisos',
  resources: 'Recursos',
  businesses: 'Negocios',
  'business-types': 'Tipos de negocio',
};

export function buildBreadcrumbs(
  pathname: string,
  opts: { propertyName?: string | null; modules?: ReadonlyArray<{ href: string; label: string }> } = {},
): Crumb[] {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];
  const moduleLabel = (href: string) => opts.modules?.find((m) => m.href === href)?.label;

  if (parts[0] === 'iam') {
    crumbs.push({ label: 'IAM', href: '/iam' });
    let href = '/iam';
    for (const seg of parts.slice(1)) {
      href += `/${seg}`;
      crumbs.push({ label: SEGMENT_LABELS[seg] ?? seg, href });
    }
  } else if (parts[0] === 'properties') {
    if (parts.length === 1 || !/^\d+$/.test(parts[1])) {
      crumbs.push({ label: 'Propiedades', href: '/properties' });
    } else {
      const base = `/properties/${parts[1]}`;
      crumbs.push({ label: opts.propertyName || 'Propiedad', href: base });
      let href = base;
      for (let i = 2; i < parts.length; i++) {
        const seg = parts[i];
        href += `/${seg}`;
        if (seg === 'voting-groups') {
          crumbs.push({ label: moduleLabel(href) ?? 'Votaciones', href });
        } else if (parts[i - 1] === 'voting-groups' && /^\d+$/.test(seg)) {
          // Una asamblea no tiene pantalla propia: vuelve a la lista de asambleas.
          crumbs.push({ label: 'Asamblea', href: href.replace(/\/\d+$/, '') });
        } else if (seg === 'votings') {
          continue; // /votings/:id se muestra como "Votación"
        } else if (parts[i - 1] === 'votings' && /^\d+$/.test(seg)) {
          crumbs.push({ label: 'Votación' });
        } else {
          crumbs.push({ label: moduleLabel(href) ?? SEGMENT_LABELS[seg] ?? seg, href });
        }
      }
    }
  }

  // El último paso es la pantalla actual: sin enlace.
  if (crumbs.length > 0) crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  return crumbs;
}
