/**
 * Lista de usuarios (rediseño IAM 2a): quién es, su rol en cada propiedad, cuándo entró por
 * última vez y su estado. Clic en la fila abre la ficha; el menú de cada fila trae las acciones.
 */

'use client';

import type { ReactNode } from 'react';
import { DsTable, DsStatus, VtMenu, type DsColumn, type VtMenuItem } from '@shared/ui/ds';
import { hasNoRole, lastAccessLabel, roleAssignmentsOf } from '../../domain/entities/users-overview.entity';
import type { UserRow } from './user-actions';

const AVATAR_TONES = [
  ['#E3F5F5', '#0C6B76'],
  ['#f3e6dc', '#8a4a26'],
  ['#e6e9f3', '#3b4a7a'],
  ['#e9f0e2', '#3f5a2a'],
  ['#efe6f0', '#6a3d70'],
] as const;

export function UserAvatar({ user, size = 36 }: { user: Pick<UserRow, 'id' | 'name' | 'avatar_url'>; size?: number }) {
  const [bg, fg] = AVATAR_TONES[Math.abs(user.id) % AVATAR_TONES.length];
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  if (user.avatar_url) {
    return <img src={user.avatar_url} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden="true"
      className="rounded-full shrink-0 inline-flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.36) }}
    >
      {initials || '?'}
    </span>
  );
}

export function RoleChip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'brand' | 'warn' | 'ink' }) {
  const cls = {
    default: 'bg-[#f0eeeb] text-[#3d3c39]',
    brand: 'bg-[#E3F5F5] text-[#0C6B76]',
    warn: 'bg-[#fbe9e4] text-[#9a4528]',
    ink: 'bg-[#1a1a1a] text-white',
  }[tone];
  return <span className={`inline-flex px-2.5 py-[3px] rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

/** Roles del usuario como etiquetas: "Super admin", "Administrador · Tayazal" o "Sin rol asignado". */
export function UserRoleChips({ user }: { user: UserRow }) {
  if (user.is_super_user) return <RoleChip label="Super admin" tone="ink" />;
  if (hasNoRole(user)) return <RoleChip label="Sin rol asignado" tone="warn" />;
  return (
    <div className="flex flex-wrap gap-1.5">
      {roleAssignmentsOf(user).map((a) => (
        <RoleChip key={`${a.businessId}-${a.roleId}`} label={`${a.roleName} · ${a.businessName}`} tone={/admin/i.test(a.roleName) ? 'brand' : 'default'} />
      ))}
    </div>
  );
}

export function userStatus(user: Pick<UserRow, 'is_active' | 'last_login_at'>): { label: string; color: string } {
  if (!user.is_active) return { label: 'Inactivo', color: '#8a8580' };
  if (!user.last_login_at) return { label: 'Sin entrar', color: '#b5532f' };
  return { label: 'Activo', color: '#1f8a4c' };
}

interface UsersTableProps {
  users: UserRow[];
  loading?: boolean;
  selectedId?: number | null;
  onSelect?: (user: UserRow) => void;
  menuItems: (user: UserRow) => VtMenuItem[];
  footer?: ReactNode;
}

export function UsersTable({ users, loading = false, selectedId, onSelect, menuItems, footer }: UsersTableProps) {
  const columns: DsColumn<UserRow>[] = [
    {
      key: 'user',
      label: 'Usuario',
      width: 'minmax(220px, 1.3fr)',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={u} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{u.name}</span>
            <span className="text-[13px] text-[#6b6660] truncate">{u.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'roles', label: 'Rol en cada propiedad', width: 'minmax(220px, 1.4fr)', render: (u) => <UserRoleChips user={u} /> },
    {
      key: 'last',
      label: 'Último acceso',
      width: '140px',
      render: (u) => <span className="text-[13px] text-[#4b4a46]">{lastAccessLabel(u.last_login_at)}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      width: '110px',
      render: (u) => {
        const s = userStatus(u);
        return <DsStatus label={s.label} color={s.color} />;
      },
    },
    {
      key: 'actions',
      // `relative`: el texto oculto (absoluto) queda dentro de la tabla y no ensancha la página.
      label: (
        <span className="relative">
          <span className="sr-only">Acciones</span>
        </span>
      ),
      width: '44px',
      align: 'right',
      render: (u) => (
        // Abrir el menú no abre la ficha de la fila.
        <div onClick={(e) => e.stopPropagation()}>
          <VtMenu label={`Acciones de ${u.name}`} items={menuItems(u)} size={34} />
        </div>
      ),
    },
  ];

  return (
    <DsTable
      ariaLabel="Usuarios"
      columns={columns}
      rows={users}
      rowKey={(u) => u.id}
      selectedKey={selectedId ?? null}
      onRowClick={onSelect}
      loading={loading}
      minWidth={760}
      empty="No hay usuarios con estos filtros."
      footer={footer}
    />
  );
}
