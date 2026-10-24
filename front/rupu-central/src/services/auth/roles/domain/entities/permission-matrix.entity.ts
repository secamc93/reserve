/**
 * Matriz de permisos de un rol (rediseño IAM 2b): filas por recurso (módulo), columnas por
 * acción (Ver, Crear, Editar, Eliminar) y el nivel de acceso de cada fila.
 *
 * El back reemplaza TODOS los permisos del rol al asignar (`POST /roles/:id/permissions`), así
 * que al guardar se envía el conjunto completo: los marcados en la matriz más los que el rol ya
 * tenía y la matriz no muestra (p. ej. de otro tipo de negocio), para no borrarlos sin querer.
 */

export interface MatrixPermission {
  id: number;
  resource: string;
  action: string;
}

export interface PermissionMatrixRow {
  resource: string;
  /** Permiso por acción; sin entrada = esa acción no existe para el recurso. */
  cells: Record<string, number>;
}

export interface PermissionMatrix {
  actions: string[];
  rows: PermissionMatrixRow[];
}

export type AccessLevel = 'all' | 'partial' | 'read' | 'none';

const ACTION_ORDER = ['Read', 'Create', 'Update', 'Delete'];

const ACTION_LABELS: Record<string, string> = {
  Read: 'Ver',
  Create: 'Crear',
  Update: 'Editar',
  Delete: 'Eliminar',
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  all: 'Todo',
  partial: 'Parcial',
  read: 'Solo ver',
  none: 'Sin acceso',
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function buildPermissionMatrix(permissions: MatrixPermission[]): PermissionMatrix {
  const byResource = new Map<string, Record<string, number>>();
  const actions = new Set<string>();
  for (const p of permissions) {
    if (!p.resource || !p.action) continue;
    actions.add(p.action);
    const cells = byResource.get(p.resource) ?? {};
    if (cells[p.action] === undefined) cells[p.action] = p.id;
    byResource.set(p.resource, cells);
  }
  const rank = (a: string) => {
    const i = ACTION_ORDER.indexOf(a);
    return i === -1 ? ACTION_ORDER.length : i;
  };
  return {
    actions: [...actions].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'es')),
    rows: [...byResource.entries()]
      .map(([resource, cells]) => ({ resource, cells }))
      .sort((a, b) => a.resource.localeCompare(b.resource, 'es')),
  };
}

/** Nivel de una fila según los permisos marcados: todo, solo ver, parcial o sin acceso. */
export function accessLevel(row: PermissionMatrixRow, selected: ReadonlySet<number>): AccessLevel {
  const ids = Object.values(row.cells);
  const on = ids.filter((id) => selected.has(id));
  if (ids.length === 0 || on.length === 0) return 'none';
  if (on.length === ids.length) return 'all';
  if (on.length === 1 && row.cells.Read !== undefined && selected.has(row.cells.Read)) return 'read';
  return 'partial';
}

/** Ids de todos los permisos que muestra la matriz. */
export function matrixPermissionIds(matrix: PermissionMatrix): number[] {
  return matrix.rows.flatMap((r) => Object.values(r.cells));
}

/** Conjunto a enviar al guardar: los marcados más los que el rol tenía fuera de la matriz. */
export function permissionIdsToSave(original: readonly number[], visible: readonly number[], selected: ReadonlySet<number>): number[] {
  const shown = new Set(visible);
  const kept = original.filter((id) => !shown.has(id));
  const checked = visible.filter((id) => selected.has(id));
  return [...new Set([...kept, ...checked])].sort((a, b) => a - b);
}

/** Cuántas casillas de la matriz cambiaron respecto a lo guardado. */
export function countMatrixChanges(original: readonly number[], visible: readonly number[], selected: ReadonlySet<number>): number {
  const had = new Set(original);
  return visible.filter((id) => had.has(id) !== selected.has(id)).length;
}

/**
 * Qué puede hacer un rol, módulo por módulo: el nivel se mide contra las acciones que existen
 * para cada recurso en el catálogo (Asistencia solo tiene Ver y Editar: con ambas es "Todo").
 * Omite los módulos sin acceso.
 */
export function roleCapabilities(catalog: MatrixPermission[], rolePermissionIds: readonly number[]): { resource: string; level: AccessLevel }[] {
  const granted = new Set(rolePermissionIds);
  return buildPermissionMatrix(catalog)
    .rows.map((row) => ({ resource: row.resource, level: accessLevel(row, granted) }))
    .filter((r) => r.level !== 'none');
}
