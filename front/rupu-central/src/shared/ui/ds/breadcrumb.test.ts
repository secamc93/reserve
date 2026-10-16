import { describe, expect, it } from 'vitest';
import { breadcrumbFor } from './breadcrumb';

describe('breadcrumbFor', () => {
  it('dentro de un módulo: propiedad / módulo', () => {
    expect(breadcrumbFor('/properties/1/parking', 'Tayazal de Suba')).toEqual({ parent: 'Tayazal de Suba', current: 'Parqueaderos' });
    expect(breadcrumbFor('/properties/1/voting-groups/2/attendance/3', 'Tayazal de Suba').current).toBe('Votaciones');
  });
  it('en el resumen: Propiedad horizontal / propiedad', () => {
    expect(breadcrumbFor('/properties/1', 'Tayazal de Suba')).toEqual({ parent: 'Propiedad horizontal', current: 'Tayazal de Suba' });
  });
  it('en el selector', () => {
    expect(breadcrumbFor('/properties', null).current).toBe('Elegir propiedad');
  });
});
