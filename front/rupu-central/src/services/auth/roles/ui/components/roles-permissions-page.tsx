/**
 * Roles y permisos (rediseño IAM 2b): a la izquierda los roles, a la derecha la matriz del rol
 * elegido (?rol=) con una fila por módulo y una casilla por acción. Los cambios se acumulan y se
 * guardan juntos desde la barra inferior.
 */

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import { DsCard, VtDialog, VtNotice, useUrlFilters, vtBtn, vtInput } from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import { getPermissionsListAction } from '@/services/auth/permissions/infrastructure/actions';
import { getUsersAction } from '@/services/auth/users/infrastructure/actions';
import {
  assignRolePermissionsAction,
  getRolePermissionsAction,
  getRolesAction,
  updateRoleAction,
  type RoleData,
} from '../../infrastructure/actions';
import {
  ACCESS_LEVEL_LABELS,
  accessLevel,
  actionLabel,
  buildPermissionMatrix,
  countMatrixChanges,
  matrixPermissionIds,
  permissionIdsToSave,
  type AccessLevel,
  type PermissionMatrix,
} from '../../domain/entities/permission-matrix.entity';
import { CreateRoleModal } from './create-role-modal';
import { UpdateRoleModal } from './update-role-modal';

const LEVEL_STYLE: Record<AccessLevel, string> = {
  all: 'bg-[#0F7F8A] text-white',
  partial: 'bg-[#E3F5F5] text-[#0C6B76]',
  read: 'bg-white text-[#4b4a46] border border-[#d6d3cd]',
  none: 'bg-[#f0eeeb] text-[#6b6660]',
};

const isPlatform = (role: RoleData) => role.scopeCode === 'platform';

export function RolesPermissionsPage() {
  const token = TokenStorage.getBusinessToken() ?? '';
  const { values, setFilters } = useUrlFilters(['rol'] as const);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState<number | null>(null);

  const [matrix, setMatrix] = useState<PermissionMatrix>({ actions: [], rows: [] });
  const [original, setOriginal] = useState<number[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const loadRoles = useCallback(async () => {
    if (!token) return;
    setRolesLoading(true);
    const r = await getRolesAction(token, { page_size: 200 });
    if (r.success && r.data) {
      // Primero los de plataforma, luego por nombre.
      setRoles([...r.data.roles].sort((a, b) => Number(isPlatform(b)) - Number(isPlatform(a)) || a.name.localeCompare(b.name, 'es')));
      setRolesError(null);
    } else {
      setRolesError(r.error ?? 'No se pudieron cargar los roles');
    }
    setRolesLoading(false);
  }, [token]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const role = roles.find((r) => String(r.id) === values.rol) ?? roles[0] ?? null;
  const visible = useMemo(() => matrixPermissionIds(matrix), [matrix]);
  const changes = countMatrixChanges(original, visible, selected);

  const loadMatrix = useCallback(async (target: RoleData) => {
    setMatrixLoading(true);
    setMatrixError(null);
    setNotice(null);
    setUserCount(null);
    const [all, mine, users] = await Promise.all([
      getPermissionsListAction(token, target.businessTypeId ? { business_type_id: target.businessTypeId } : undefined),
      getRolePermissionsAction({ role_id: target.id }, token),
      getUsersAction({ token, role_id: target.id, page: 1, page_size: 1 }),
    ]);
    if (!all.success || !all.data || !mine.success || !mine.data) {
      setMatrixError(all.error ?? mine.error ?? 'No se pudieron cargar los permisos');
      setMatrix({ actions: [], rows: [] });
      setMatrixLoading(false);
      return;
    }
    const ids = mine.data.permissions.map((p) => p.id);
    setMatrix(buildPermissionMatrix(all.data.permissions));
    setOriginal(ids);
    setSelected(new Set(ids));
    setUserCount(users.success && users.data ? users.data.count : null);
    setMatrixLoading(false);
  }, [token]);

  const roleId = role?.id;
  useEffect(() => {
    if (role) loadMatrix(role);
    // Recarga al cambiar de rol, no al refrescar la lista de roles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId, loadMatrix]);

  const chooseRole = (id: number) => {
    if (id === roleId) return;
    if (changes > 0) {
      setPendingRoleId(id);
      return;
    }
    setFilters({ rol: String(id) });
  };

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    if (!role) return;
    setSaving(true);
    const ids = permissionIdsToSave(original, visible, selected);
    const r = await assignRolePermissionsAction({ role_id: role.id, permission_ids: ids }, token);
    setSaving(false);
    if (!r.success) {
      setNotice({ ok: false, text: r.error ?? 'No se pudieron guardar los permisos' });
      return;
    }
    setOriginal(ids);
    setNotice({ ok: true, text: `Permisos de ${role.name} guardados. Aplican la próxima vez que cada usuario entre.` });
  };

  const handleUpdateRole = async (data: Parameters<typeof updateRoleAction>[0]) => {
    setEditSaving(true);
    const r = await updateRoleAction(data, token);
    setEditSaving(false);
    if (!r.success) {
      setNotice({ ok: false, text: r.error ?? 'No se pudo actualizar el rol' });
      return;
    }
    setEditOpen(false);
    loadRoles();
  };

  return (
    <IamPage>
      <IamPageHeader
        title="Roles y permisos"
        description="Un rol es un paquete de permisos. Marca qué puede ver y hacer cada rol en cada módulo."
        actions={
          <button type="button" className={vtBtn.primary} onClick={() => setCreateOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo rol
          </button>
        }
      />

      {rolesError && <VtNotice>{rolesError}</VtNotice>}

      {/* Teléfono: el rol se elige con un select para que la matriz quede a la vista. */}
      {roles.length > 0 && (
        <select aria-label="Rol" className={`${vtInput} md:hidden`} value={roleId ?? ''} onChange={(e) => chooseRole(Number(e.target.value))}>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      )}

      <div className="flex flex-wrap gap-5 items-start">
        <nav aria-label="Roles" className="max-md:hidden flex-[1_1_260px] md:max-w-[320px] flex flex-col gap-2">
          {rolesLoading && <div className="text-[13px] text-[#8a8580] px-1">Cargando roles…</div>}
          {!rolesLoading && roles.length === 0 && <div className="text-[13px] text-[#8a8580] px-1">Aún no hay roles. Crea el primero.</div>}
          {roles.map((r) => {
            const on = r.id === roleId;
            return (
              <button
                key={r.id}
                type="button"
                aria-current={on ? 'true' : undefined}
                onClick={() => chooseRole(r.id)}
                className={`text-left flex flex-col gap-1.5 p-3.5 rounded-xl border transition-colors ${
                  on ? 'bg-white border-[#0F7F8A] shadow-[0_0_0_3px_#E3F5F5]' : 'border-[#e4e2dd] hover:bg-white'
                }`}
              >
                <span className="font-semibold text-[15px]">{r.name}</span>
                {r.description && <span className="text-[13px] text-[#4b4a46] leading-snug line-clamp-2">{r.description}</span>}
                <span className="flex flex-wrap gap-1.5">
                  {isPlatform(r) ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#1a1a1a] text-white text-[11px] font-semibold">Plataforma</span>
                  ) : (
                    r.businessTypeName && <span className="px-2 py-0.5 rounded-md bg-[#f0eeeb] text-[#3d3c39] text-[11px] font-medium">{r.businessTypeName}</span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {role && (
          <DsCard className="flex-[999_1_560px] min-w-0">
            <section aria-label={`Permisos del rol ${role.name}`}>
              <div className="p-5 flex flex-wrap justify-between gap-4 border-b border-[#e4e2dd]">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="m-0 text-xl font-bold">{role.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-[#f0eeeb] text-[#3d3c39] text-xs font-medium">
                      {isPlatform(role) ? 'Plataforma' : 'Propiedad'}
                    </span>
                  </div>
                  {role.description && <p className="m-0 text-sm text-[#4b4a46]">{role.description}</p>}
                  {userCount !== null && (
                    <Link href={`/iam/users?rol=${role.id}`} className="text-[13px] font-semibold text-[#0F7F8A] hover:text-[#0C6B76] mt-1">
                      {userCount === 1 ? '1 usuario con este rol' : `${userCount} usuarios con este rol`}
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <button type="button" className={vtBtn.secondary} onClick={() => setEditOpen(true)}>Editar rol</button>
                </div>
              </div>

              {notice && (
                <div className="px-5 pt-4">
                  <VtNotice tone={notice.ok ? 'ok' : 'error'}>{notice.text}</VtNotice>
                </div>
              )}
              {matrixError && (
                <div className="px-5 pt-4">
                  <VtNotice>{matrixError}</VtNotice>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm min-w-[620px]">
                  <thead>
                    <tr className={`${dsMono} text-[10px] uppercase tracking-[.06em] text-[#8a8580]`}>
                      <th scope="col" className="sticky left-0 z-[1] bg-white text-left font-medium px-5 py-3 border-b border-[#e4e2dd]">Módulo</th>
                      {matrix.actions.map((a) => (
                        <th key={a} scope="col" className="font-medium px-2 py-3 border-b border-[#e4e2dd] w-[84px]">{actionLabel(a)}</th>
                      ))}
                      <th scope="col" className="font-medium pl-2 pr-5 py-3 border-b border-[#e4e2dd] w-[110px] text-right">Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixLoading ? (
                      <tr>
                        <td colSpan={matrix.actions.length + 2} className="px-5 py-10 text-center text-[#8a8580]">Cargando permisos…</td>
                      </tr>
                    ) : matrix.rows.length === 0 ? (
                      <tr>
                        <td colSpan={matrix.actions.length + 2} className="px-5 py-10 text-center text-[#8a8580]">
                          No hay permisos definidos para este tipo de rol. Créalos en Avanzado › Permisos.
                        </td>
                      </tr>
                    ) : (
                      matrix.rows.map((row) => {
                        const level = accessLevel(row, selected);
                        return (
                          <tr key={row.resource}>
                            <th scope="row" className="sticky left-0 z-[1] bg-white text-left font-semibold px-5 max-md:px-3 max-md:max-w-[130px] py-3 border-b border-[#efedea]">{row.resource}</th>
                            {matrix.actions.map((a) => {
                              const id = row.cells[a];
                              return (
                                <td key={a} className="text-center border-b border-[#efedea]">
                                  {id === undefined ? (
                                    <span className="text-[#c9c6c0]" aria-label={`${row.resource}: ${actionLabel(a)} no existe`}>—</span>
                                  ) : (
                                    <input
                                      type="checkbox"
                                      aria-label={`${row.resource}: ${actionLabel(a).toLowerCase()}`}
                                      checked={selected.has(id)}
                                      onChange={() => toggle(id)}
                                      disabled={saving}
                                      className="w-5 h-5 accent-[#0F7F8A] cursor-pointer"
                                    />
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-right pl-2 pr-5 py-3 border-b border-[#efedea]">
                              <span className={`text-xs font-semibold px-2.5 py-[3px] rounded-md whitespace-nowrap ${LEVEL_STYLE[level]}`}>{ACCESS_LEVEL_LABELS[level]}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {changes > 0 && (
                <div role="region" aria-label="Cambios sin guardar" className="sticky bottom-0 max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[2] flex flex-wrap justify-between items-center gap-3 px-5 py-3.5 bg-[#1a1a1a] text-white rounded-b-[20px] max-md:rounded-[20px]">
                  <span className="text-sm">
                    <span className={dsMono}>{changes}</span> {changes === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
                    {userCount ? ` · afecta a ${userCount} ${userCount === 1 ? 'usuario' : 'usuarios'}` : ''}
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelected(new Set(original))} disabled={saving} className="h-10 px-4 rounded-full border border-[#4b4a46] text-sm hover:bg-white/10 disabled:opacity-50">
                      Descartar
                    </button>
                    <button type="button" onClick={save} disabled={saving} className="h-10 px-5 rounded-full bg-[#2CD8CC] text-[#0b2e31] text-sm font-bold hover:bg-[#5fe3da] disabled:opacity-50">
                      {saving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </DsCard>
        )}
      </div>

      <CreateRoleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          loadRoles();
        }}
      />
      <UpdateRoleModal isOpen={editOpen} onClose={() => setEditOpen(false)} role={role} onSubmit={handleUpdateRole} loading={editSaving} />

      <VtDialog
        open={pendingRoleId !== null}
        onClose={() => setPendingRoleId(null)}
        width={440}
        eyebrow="Cambios sin guardar"
        title={`¿Descartar los cambios de ${role?.name ?? 'este rol'}?`}
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setPendingRoleId(null)}>Seguir editando</button>
            <button
              type="button"
              className={vtBtn.primary}
              onClick={() => {
                const id = pendingRoleId;
                setPendingRoleId(null);
                setSelected(new Set(original));
                if (id !== null) setFilters({ rol: String(id) });
              }}
            >
              Descartar y cambiar
            </button>
          </>
        }
      >
        <p className="m-0 text-[13px] text-[#4b4a46]">
          Tienes {changes} {changes === 1 ? 'casilla cambiada' : 'casillas cambiadas'} sin guardar.
        </p>
      </VtDialog>
    </IamPage>
  );
}
