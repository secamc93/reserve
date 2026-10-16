import { describe, expect, it } from 'vitest';
import { canSwitchProperty, loginDestination, toPropertyOptions } from './properties';

describe('toPropertyOptions', () => {
  it('solo propiedades horizontales activas, ordenadas por nombre', () => {
    const options = toPropertyOptions([
      { id: 2, name: 'Zafiro', business_type_code: 'horizontal_property' },
      { id: 1, name: 'Tayazal de Suba', business_type_code: 'horizontal_property', primary_color: '#111' },
      { id: 3, name: 'Restaurante', business_type_code: 'restaurant' },
      { id: 4, name: 'Inactiva', business_type_code: 'horizontal_property', is_active: false },
      { id: 5, name: 'Sin tipo' },
    ]);
    expect(options.map((o) => o.id)).toEqual([5, 1, 2]);
    expect(options.find((o) => o.id === 1)?.primaryColor).toBe('#111');
  });
  it('sin negocios: lista vacía', () => {
    expect(toPropertyOptions(null)).toEqual([]);
  });
});

describe('canSwitchProperty', () => {
  it('solo con dos o más propiedades', () => {
    expect(canSwitchProperty([])).toBe(false);
    expect(canSwitchProperty([{ id: 1, name: 'A' }])).toBe(false);
    expect(canSwitchProperty([{ id: 1, name: 'A' }, { id: 2, name: 'B' }])).toBe(true);
  });
});

describe('loginDestination', () => {
  it('una sola propiedad: directo a ella', () => {
    expect(loginDestination({ isSuperAdmin: false, propertyIds: [7] })).toEqual({ kind: 'property', id: 7, href: '/properties/7' });
  });
  it('varias propiedades: al selector', () => {
    expect(loginDestination({ isSuperAdmin: false, propertyIds: [7, 8] })).toEqual({ kind: 'picker', href: '/properties' });
  });
  it('super admin: al selector aunque su login no traiga propiedades (ve todas)', () => {
    expect(loginDestination({ isSuperAdmin: true, propertyIds: [] }).kind).toBe('picker');
  });
  it('sin propiedades: a /home', () => {
    expect(loginDestination({ isSuperAdmin: false, propertyIds: [] })).toEqual({ kind: 'none', href: '/home' });
  });
});
