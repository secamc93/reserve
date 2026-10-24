/**
 * Ficha lateral del usuario (rediseño IAM 2a): contacto, estado, sus accesos por propiedad y
 * qué puede hacer con el rol de cada una (leído de los permisos del rol).
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DsEyebrow, DsSidePanel, DsStatus, VtMenu, VtNotice, vtBtn, type VtMenuItem } from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import { getRolePermissionsAction } from '@/services/auth/roles/infrastructure/actions';
import { getPermissionsListAction } from '@/services/auth/permissions/infrastructure/actions';
import { ACCESS_LEVEL_LABELS, roleCapabilities, type AccessLevel } from '@/services/auth/roles/domain/entities/permission-matrix.entity';
import { lastAccessLabel, roleAssignmentsOf } from '../../domain/entities/users-overview.entity';
import { RoleChip, UserAvatar, userStatus } from './users-table';
import type { UserRow } from './user-actions';

const LEVEL_STYLE: Record<AccessLevel, string> = {
  all: 'bg-[#0F7F8A] text-white',
  partial: 'bg-[#E3F5F5] text-[#0C6B76]',
  read: 'bg-white text-[#4b4a46] border border-[#d6d3cd]',
  none: 'bg-[#f0eeeb] text-[#6b6660]',
};

export function AccessLevelBadge({ level }: { level: AccessLevel }) {
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${LEVEL_STYLE[level]}`}>{ACCESS_LEVEL_LABELS[level]}</span>;
}

function RoleCapabilities({ roleId }: { roleId: number }) {
  const [rows, setRows] = useState<{ resource: string; level: AccessLevel }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setRows(null);
    setError(null);
    Promise.all([getRolePermissionsAction({ role_id: roleId }, token), getPermissionsListAction(token)]).then(([mine, catalog]) => {
      if (cancelled) return;
      if (!mine.success || !mine.data || !catalog.success || !catalog.data) {
        setError(mine.error ?? catalog.error ?? 'No se pudieron leer los permisos del rol');
        return;
      }
      setRows(roleCapabilities(catalog.data.permissions, mine.data.permissions.map((p) => p.id)));
    });
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  if (error) return <VtNotice>{error}</VtNotice>;
  if (!rows) return <div className="text-[13px] text-[#8a8580]">Cargando permisos…</div>;
  if (rows.length === 0) return <div className="text-[13px] text-[#8a8580]">Este rol no tiene permisos: el usuario entra pero no ve ningún módulo.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {rows.map((r) => (
        <div key={r.resource} className="flex justify-between items-center gap-2 px-2.5 py-2 bg-[#f5f5f4] rounded-lg text-[13px]">
          <span className="truncate">{r.resource}</span>
          <AccessLevelBadge level={r.level} />
        </div>
      ))}
    </div>
  );
}

interface UserSidePanelProps {
  user: UserRow | null;
  onClose: () => void;
  onEdit: (user: UserRow) => void;
  onAssignRoles: (user: UserRow) => void;
  menuItems: (user: UserRow) => VtMenuItem[];
}

export function UserSidePanel({ user, onClose, onEdit, onAssignRoles, menuItems }: UserSidePanelProps) {
  const assignments = user ? roleAssignmentsOf(user) : [];
  const [activeBusiness, setActiveBusiness] = useState<number | null>(null);
  useEffect(() => setActiveBusiness(null), [user?.id]);
  const current = assignments.find((a) => a.businessId === activeBusiness) ?? assignments[0];

  if (!user) return null;
  const status = userStatus(user);

  return (
    <DsSidePanel
      open
      onClose={onClose}
      width={460}
      eyebrow="Usuario"
      title={user.name}
      subtitle={user.email}
      footer={
        <>
          <VtMenu label={`Más acciones de ${user.name}`} items={menuItems(user)} size={40} />
          <button type="button" className={vtBtn.secondary} onClick={() => onEdit(user)}>Editar datos</button>
          <button type="button" className={vtBtn.primary} onClick={() => onAssignRoles(user)}>Cambiar roles</button>
        </>
      }
    >
      <div className="flex items-center gap-3.5">
        <UserAvatar user={user} size={52} />
        <div className="flex flex-col gap-1 min-w-0">
          <DsStatus label={status.label} color={status.color} />
          <span className="text-[13px] text-[#4b4a46]">Último acceso: {lastAccessLabel(user.last_login_at)}</span>
          {user.phone && <span className={`${dsMono} text-[13px] text-[#4b4a46]`}>{user.phone}</span>}
        </div>
      </div>

      <section className="flex flex-col gap-2.5" aria-label="Accesos">
        <DsEyebrow>Accesos</DsEyebrow>
        {user.is_super_user && (
          <VtNotice tone="info">Super admin: ve y administra todas las propiedades y las herramientas de plataforma.</VtNotice>
        )}
        {assignments.length === 0 && !user.is_super_user && (
          <VtNotice>No tiene rol en ninguna propiedad: puede entrar, pero no ve ningún módulo.</VtNotice>
        )}
        {assignments.map((a) => (
          <div key={`${a.businessId}-${a.roleId}`} className="flex justify-between items-center gap-3 border border-[#e4e2dd] rounded-xl px-3 py-2.5">
            <span className="font-semibold text-sm truncate">{a.businessName}</span>
            <RoleChip label={a.roleName} tone={/admin/i.test(a.roleName) ? 'brand' : 'default'} />
          </div>
        ))}
      </section>

      {current && (
        <section className="flex flex-col gap-2.5" aria-label="Qué puede hacer">
          <DsEyebrow>Qué puede hacer como {current.roleName}</DsEyebrow>
          {assignments.length > 1 && (
            <div role="group" aria-label="Propiedad" className="flex flex-wrap gap-1">
              {assignments.map((a) => (
                <button
                  key={a.businessId}
                  type="button"
                  aria-pressed={a.businessId === current.businessId}
                  onClick={() => setActiveBusiness(a.businessId)}
                  className={`h-8 max-md:h-10 px-3 rounded-full text-xs font-medium ${a.businessId === current.businessId ? 'bg-[#1a1a1a] text-white' : 'text-[#4b4a46] hover:bg-[#f5f5f4]'}`}
                >
                  {a.businessName}
                </button>
              ))}
            </div>
          )}
          <RoleCapabilities roleId={current.roleId} />
          <Link href={`/iam/roles?rol=${current.roleId}`} className="text-[13px] font-semibold text-[#0F7F8A] hover:text-[#0C6B76]">
            Ver el rol completo →
          </Link>
        </section>
      )}
    </DsSidePanel>
  );
}
