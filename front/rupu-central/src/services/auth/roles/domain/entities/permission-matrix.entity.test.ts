import { describe, expect, it } from 'vitest';
import {
  accessLevel,
  actionLabel,
  buildPermissionMatrix,
  countMatrixChanges,
  matrixPermissionIds,
  permissionIdsToSave,
  roleCapabilities,
} from './permission-matrix.entity';

const perms = [
  { id: 1, resource: 'Visitas', action: 'Read' },
  { id: 2, resource: 'Visitas', action: 'Create' },
  { id: 3, resource: 'Visitas', action: 'Update' },
  { id: 4, resource: 'Visitas', action: 'Delete' },
  { id: 5, resource: 'Asistencia', action: 'Update' },
  { id: 6, resource: 'Asistencia', action: 'Read' },
  { id: 7, resource: 'Asistencia', action: 'Export' },
];

describe('buildPermissionMatrix', () => {
  it('ordena acciones Ver, Crear, Editar, Eliminar y después las demás; recursos por nombre', () => {
    const m = buildPermissionMatrix(perms);
    expect(m.actions).toEqual(['Read', 'Create', 'Update', 'Delete', 'Export']);
    expect(m.rows.map((r) => r.resource)).toEqual(['Asistencia', 'Visitas']);
    expect(m.rows[0].cells).toEqual({ Update: 5, Read: 6, Export: 7 });
    expect(actionLabel('Read')).toBe('Ver');
    expect(actionLabel('Export')).toBe('Export');
  });
});

describe('accessLevel', () => {
  const visitas = buildPermissionMatrix(perms).rows[1];
  it('distingue todo, solo ver, parcial y sin acceso', () => {
    expect(accessLevel(visitas, new Set([1, 2, 3, 4]))).toBe('all');
    expect(accessLevel(visitas, new Set([1]))).toBe('read');
    expect(accessLevel(visitas, new Set([2]))).toBe('partial');
    expect(accessLevel(visitas, new Set([1, 3]))).toBe('partial');
    expect(accessLevel(visitas, new Set([99]))).toBe('none');
  });
});

describe('permissionIdsToSave', () => {
  const visible = matrixPermissionIds(buildPermissionMatrix(perms));

  it('conserva los permisos del rol que la matriz no muestra (el back reemplaza todo)', () => {
    // 50 es de otro tipo de negocio: no está en la matriz y no se debe perder al guardar.
    expect(permissionIdsToSave([1, 2, 50], visible, new Set([1, 3]))).toEqual([1, 3, 50]);
  });

  it('cuenta solo las casillas cambiadas', () => {
    expect(countMatrixChanges([1, 2, 50], visible, new Set([1, 2]))).toBe(0);
    expect(countMatrixChanges([1, 2, 50], visible, new Set([1, 3]))).toBe(2);
  });
});

describe('roleCapabilities', () => {
  it('mide el nivel contra las acciones que existen y omite los módulos sin acceso', () => {
    // Asistencia solo tiene Ver, Editar y Export: con las tres es "Todo".
    expect(roleCapabilities(perms, [5, 6, 7, 1])).toEqual([
      { resource: 'Asistencia', level: 'all' },
      { resource: 'Visitas', level: 'read' },
    ]);
  });
});
