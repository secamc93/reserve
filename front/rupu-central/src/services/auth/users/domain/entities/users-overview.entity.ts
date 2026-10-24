/**
 * Lectura de la lista de usuarios para el rediseño de Accesos (IAM 2a y 2c): roles por
 * propiedad, último acceso legible y el resumen de lo que requiere atención.
 */

import type { UserListItem } from './user-list.entity';

type OverviewUser = Pick<UserListItem, 'id' | 'name' | 'is_active' | 'is_super_user' | 'last_login_at' | 'created_at' | 'business_role_assignments'>;

export interface RoleAssignmentView {
  businessId: number;
  businessName: string;
  roleId: number;
  roleName: string;
}

/** Días sin entrar a partir de los cuales una cuenta activa se considera sin uso. */
export const STALE_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;

export function roleAssignmentsOf(user: Pick<UserListItem, 'business_role_assignments'>): RoleAssignmentView[] {
  return (user.business_role_assignments ?? [])
    .filter((a) => a.business_id > 0 && a.role_id > 0)
    .map((a) => ({
      businessId: a.business_id,
      businessName: a.business_name || `Propiedad ${a.business_id}`,
      roleId: a.role_id,
      roleName: a.role_name,
    }));
}

/** Sin rol: ni super admin ni rol en alguna propiedad (entra, pero no ve ningún módulo). */
export function hasNoRole(user: Pick<UserListItem, 'is_super_user' | 'business_role_assignments'>): boolean {
  return !user.is_super_user && roleAssignmentsOf(user).length === 0;
}

function parse(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Hoy, 9:42 a. m." · "Ayer" · "Hace 3 días" · "Hace 2 semanas" · "Hace 4 meses" · "Nunca". */
export function lastAccessLabel(iso: string | undefined, now: Date = new Date()): string {
  const d = parse(iso);
  if (!d) return 'Nunca';
  const days = Math.round((startOfDay(now) - startOfDay(d)) / DAY);
  if (days <= 0) {
    const time = d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `Hoy, ${time}`;
  }
  if (days === 1) return 'Ayer';
  if (days < 14) return `Hace ${days} días`;
  if (days < 60) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  const years = Math.floor(days / 365);
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
}

/** Cuenta activa que no entra hace `STALE_DAYS` días (o nunca entró y se creó antes de eso). */
export function isStale(user: Pick<UserListItem, 'is_active' | 'last_login_at' | 'created_at'>, now: Date = new Date()): boolean {
  if (!user.is_active) return false;
  const ref = parse(user.last_login_at) ?? parse(user.created_at);
  if (!ref) return false;
  return now.getTime() - ref.getTime() >= STALE_DAYS * DAY;
}

export interface PropertyAccessRow {
  businessId: number;
  businessName: string;
  total: number;
  /** Usuarios por rol, de mayor a menor. */
  roles: { roleName: string; count: number }[];
}

export interface UsersOverview {
  withoutRole: OverviewUser[];
  stale: OverviewUser[];
  inactive: number;
  superAdmins: number;
  byProperty: PropertyAccessRow[];
}

export function summarizeUsers(users: OverviewUser[], now: Date = new Date()): UsersOverview {
  const props = new Map<number, { name: string; users: Set<number>; roles: Map<string, number> }>();
  for (const u of users) {
    for (const a of roleAssignmentsOf(u)) {
      const p = props.get(a.businessId) ?? { name: a.businessName, users: new Set<number>(), roles: new Map<string, number>() };
      p.users.add(u.id);
      p.roles.set(a.roleName, (p.roles.get(a.roleName) ?? 0) + 1);
      props.set(a.businessId, p);
    }
  }
  return {
    withoutRole: users.filter(hasNoRole),
    stale: users.filter((u) => isStale(u, now)),
    inactive: users.filter((u) => !u.is_active).length,
    superAdmins: users.filter((u) => u.is_super_user).length,
    byProperty: [...props.entries()]
      .map(([businessId, p]) => ({
        businessId,
        businessName: p.name,
        total: p.users.size,
        roles: [...p.roles.entries()].map(([roleName, count]) => ({ roleName, count })).sort((a, b) => b.count - a.count || a.roleName.localeCompare(b.roleName, 'es')),
      }))
      .sort((a, b) => b.total - a.total || a.businessName.localeCompare(b.businessName, 'es')),
  };
}
