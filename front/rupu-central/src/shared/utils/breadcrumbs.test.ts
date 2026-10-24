import { describe, expect, it } from 'vitest';
import { buildBreadcrumbs } from './breadcrumbs';

const modules = [
  { href: '/properties/7', label: 'Resumen' },
  { href: '/properties/7/voting-groups', label: 'Votaciones' },
  { href: '/properties/7/units', label: 'Unidades' },
];

describe('buildBreadcrumbs', () => {
  it('módulo de una propiedad: propiedad › módulo (actual sin enlace)', () => {
    expect(buildBreadcrumbs('/properties/7/units', { propertyName: 'Tayazal', modules })).toEqual([
      { label: 'Tayazal', href: '/properties/7' },
      { label: 'Unidades' },
    ]);
  });

  it('asistencia de una asamblea: cada paso vuelve a su pantalla', () => {
    expect(buildBreadcrumbs('/properties/7/voting-groups/12/attendance', { propertyName: 'Tayazal', modules })).toEqual([
      { label: 'Tayazal', href: '/properties/7' },
      { label: 'Votaciones', href: '/properties/7/voting-groups' },
      { label: 'Asamblea', href: '/properties/7/voting-groups' },
      { label: 'Asistencia' },
    ]);
  });

  it('votación en vivo', () => {
    expect(buildBreadcrumbs('/properties/7/voting-groups/12/votings/3/live', { propertyName: 'T', modules }).map((c) => c.label)).toEqual([
      'T', 'Votaciones', 'Asamblea', 'Votación', 'En vivo',
    ]);
  });

  it('tutoriales y planes', () => {
    expect(buildBreadcrumbs('/properties/7/tutorials', { propertyName: 'T', modules })).toEqual([
      { label: 'T', href: '/properties/7' },
      { label: 'Tutoriales' },
    ]);
    expect(buildBreadcrumbs('/properties/7/voting-groups/plans', { propertyName: 'T', modules }).map((c) => c.label)).toEqual(['T', 'Votaciones', 'Planes']);
  });

  it('selector de propiedades e IAM', () => {
    expect(buildBreadcrumbs('/properties')).toEqual([{ label: 'Propiedades' }]);
    expect(buildBreadcrumbs('/iam/users/create')).toEqual([
      { label: 'IAM', href: '/iam' },
      { label: 'Usuarios', href: '/iam/users' },
      { label: 'Nuevo' },
    ]);
  });
});

describe('ruta de los tutoriales de un módulo', () => {
  it('Votaciones › Tutoriales', () => {
    expect(buildBreadcrumbs('/properties/7/voting-groups/tutorials', { propertyName: 'T', modules })).toEqual([
      { label: 'T', href: '/properties/7' },
      { label: 'Votaciones', href: '/properties/7/voting-groups' },
      { label: 'Tutoriales' },
    ]);
  });
});
