import { describe, expect, it } from 'vitest';
import { BUSINESS_TYPE_CONFIG } from '../config/business-type-config';
import { RESOURCE_ROUTE_MAP } from '@/services/auth/permissions/domain/entities';
import {
  buildNavItems,
  filterSidebarItemsByResource,
  resolveAllowedPath,
  getInitials,
  isNavItemActive,
  pickBottomBarItems,
  resolveActiveProperty,
  resolveBusinessHref,
} from './navigation';

const SIDEBAR = BUSINESS_TYPE_CONFIG.horizontal_property.sidebarItems;

describe('getInitials', () => {
  it.each([
    ['Tayazal de Suba', 'TS'],
    ['Conjunto Residencial Los Pinos', 'CR'],
    ['Rupü', 'R'],
    ['  torres   del   parque ', 'TP'],
    ['ébano', 'É'],
    ['', '?'],
    [null, '?'],
    ['de la', '?'],
  ])('%j → %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('resolveBusinessHref', () => {
  it('sustituye {businessId} con la propiedad activa', () => {
    expect(resolveBusinessHref('/properties/{businessId}/units', 7)).toBe('/properties/7/units');
  });
  it.each([null, 0])('sin propiedad activa (%j) quita el segmento', (id) => {
    expect(resolveBusinessHref('/properties/{businessId}/units', id)).toBe('/properties/units');
  });
});

describe('buildNavItems', () => {
  it('módulos de la propiedad con href resuelto y etiqueta corta, en el orden del sidebar', () => {
    const items = buildNavItems({ sidebarItems: SIDEBAR, activeBusinessId: 7, canAccessIAM: false });
    expect(items.map((i) => i.id)).toEqual(SIDEBAR.map((i) => i.id));
    expect(items[0]).toMatchObject({ id: 'resumen', label: 'Resumen', shortLabel: 'Inicio', href: '/properties/7' });
    expect(items.find((i) => i.id === 'residents')?.shortLabel).toBe('Residentes');
  });

  it('agrega IAM al final según permisos (no hay módulo de Logs)', () => {
    const items = buildNavItems({ sidebarItems: SIDEBAR, activeBusinessId: 7, canAccessIAM: true });
    expect(items.slice(-1).map((i) => i.href)).toEqual(['/iam']);
    expect(items.some((i) => i.href.includes('logs'))).toBe(false);
    const onlyIam = buildNavItems({ sidebarItems: [], activeBusinessId: null, canAccessIAM: true });
    expect(onlyIam.map((i) => i.id)).toEqual(['iam']);
  });

  it('cada módulo de la propiedad tiene id único', () => {
    expect(new Set(SIDEBAR.map((i) => i.id)).size).toBe(SIDEBAR.length);
  });
});

describe('pickBottomBarItems', () => {
  const all = buildNavItems({ sidebarItems: SIDEBAR, activeBusinessId: 7, canAccessIAM: true });

  it('en la propiedad: Inicio y Residentes a la izquierda, Paquetes y Votaciones a la derecha', () => {
    const { left, right } = pickBottomBarItems(all);
    expect(left.map((i) => i.shortLabel)).toEqual(['Inicio', 'Residentes']);
    expect(right.map((i) => i.shortLabel)).toEqual(['Paquetes', 'Votaciones']);
  });

  it('si faltan preferidos, completa con los demás en orden y nunca pasa de 4', () => {
    const noVoting = all.filter((i) => i.id !== 'voting-groups' && i.id !== 'packages');
    const { left, right } = pickBottomBarItems(noVoting);
    expect([...left, ...right].map((i) => i.id)).toEqual(['resumen', 'residents', 'units', 'visits']);
  });

  it('en IAM sin propiedad: solo IAM', () => {
    const iam = buildNavItems({ sidebarItems: [], activeBusinessId: 0, canAccessIAM: true });
    const { left, right } = pickBottomBarItems(iam);
    expect([...left, ...right].map((i) => i.id)).toEqual(['iam']);
  });

  it('sin módulos: barra vacía', () => {
    expect(pickBottomBarItems([])).toEqual({ left: [], right: [] });
  });
});

describe('isNavItemActive', () => {
  const hrefs = ['/properties/7', '/properties/7/units', '/properties/7/residents'];
  it('ruta exacta e hija', () => {
    expect(isNavItemActive('/properties/7/units', '/properties/7/units', hrefs)).toBe(true);
    expect(isNavItemActive('/properties/7/units', '/properties/7/units/12', hrefs)).toBe(true);
  });
  it('Inicio solo está activo en la raíz de la propiedad, no en sus módulos', () => {
    expect(isNavItemActive('/properties/7', '/properties/7', hrefs)).toBe(true);
    expect(isNavItemActive('/properties/7', '/properties/7/units', hrefs)).toBe(false);
  });
  it('no confunde prefijos sin "/"', () => {
    expect(isNavItemActive('/iam', '/iamx', [])).toBe(false);
  });
});

describe('resolveActiveProperty', () => {
  const list = [
    { id: 3, name: 'Otro' },
    { id: 7, name: 'Tayazal de Suba', logo_url: 'https://x/logo.png', primary_color: '#123456' },
  ];
  it('encuentra la propiedad activa con logo y color', () => {
    expect(resolveActiveProperty(list, 7)).toEqual({ id: 7, name: 'Tayazal de Suba', logoUrl: 'https://x/logo.png', primaryColor: '#123456' });
  });
  it('logo vacío queda undefined (se usan iniciales)', () => {
    expect(resolveActiveProperty([{ id: 1, name: 'A', logo_url: '' }], 1)?.logoUrl).toBeUndefined();
  });
  it.each([[0], [null], [99]])('sin propiedad activa o no encontrada (%j) → null', (id) => {
    expect(resolveActiveProperty(list, id as number | null)).toBeNull();
  });
  it('lista nula → null', () => {
    expect(resolveActiveProperty(null, 7)).toBeNull();
  });
});

describe('permisos por módulo', () => {
  const items = SIDEBAR.map((i) => ({ ...i, href: resolveBusinessHref(i.href, 7) }));
  const soloVotaciones = (r: string) => r === 'Votaciones';

  it('cada módulo de la barra tiene un recurso conocido', () => {
    for (const item of SIDEBAR) expect(Object.keys(RESOURCE_ROUTE_MAP)).toContain(item.resource);
  });

  it('un consejero (solo Votaciones) ve solo Votaciones', () => {
    expect(filterSidebarItemsByResource(SIDEBAR, soloVotaciones).map((i) => i.id)).toEqual(['voting-groups']);
  });

  it('el super admin (hasResource siempre true) ve todos los módulos', () => {
    expect(filterSidebarItemsByResource(SIDEBAR, () => true)).toHaveLength(SIDEBAR.length);
  });

  it.each([
    ['/properties/7', '/properties/7/voting-groups'],
    ['/properties/7/residents', '/properties/7/voting-groups'],
    ['/properties/7/packages/3', '/properties/7/voting-groups'],
    ['/properties/7/voting-groups', '/properties/7/voting-groups'],
    ['/properties/7/voting-groups/2/attendance', '/properties/7/voting-groups/2/attendance'],
    ['/properties', '/properties'],
  ])('consejero en %s → %s', (path, expected) => {
    expect(resolveAllowedPath(path, items, soloVotaciones)).toBe(expected);
  });

  it('sin ningún recurso no hay a dónde llevarlo', () => {
    expect(resolveAllowedPath('/properties/7/units', items, () => false)).toBeNull();
  });
});

describe('votación en vivo', () => {
  const items = SIDEBAR.map((i) => ({ ...i, href: resolveBusinessHref(i.href, 7) }));
  const live = '/properties/7/voting-groups/2/votings/5/live';

  it('un consejero (Votaciones sin "Votación en vivo") vuelve a Votaciones', () => {
    expect(resolveAllowedPath(live, items, (r) => r === 'Votaciones')).toBe('/properties/7/voting-groups');
  });

  it('con el recurso entra al panel en vivo', () => {
    expect(resolveAllowedPath(live, items, (r) => r === 'Votaciones' || r === 'Votación en vivo')).toBe(live);
  });
});
