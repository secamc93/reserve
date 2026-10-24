/**
 * Usuarios (rediseño IAM 2a): buscador y filtros en la URL (?q=&estado=&rol=&propiedad=), lista
 * con el rol por propiedad y ficha lateral al tocar una fila.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import { DsChips, DsSearch, VtNotice, dsSelect, useDebouncedValue, useUrlFilters, vtBtn } from '@shared/ui/ds';
import { Pagination } from '@shared/ui/pagination';
import { getRolesAction } from '@/services/auth/roles/infrastructure/actions';
import { getBusinessesAction } from '@/services/auth/businesses/infrastructure/actions';
import { useUsers, type UseUsersReturn } from '../hooks/use-users';
import { UsersTable } from './users-table';
import { UserForm } from './user-form';
import { AssignRolesModal } from './assign-roles-modal';
import { UserSidePanel } from './user-side-panel';
import { useUserActions, type UserRow } from './user-actions';

const FILTER_KEYS = ['q', 'estado', 'rol', 'propiedad'] as const;
type FilterValues = Record<(typeof FILTER_KEYS)[number], string>;

const STATUS_CHIPS = [
  { id: '', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'inactivos', label: 'Inactivos' },
];

/** Filtros de la URL → parámetros del back. El buscador va a correo, celular o nombre según lo escrito. */
export function usersQueryFromUrl(values: FilterValues): UseUsersReturn['filters'] {
  const q = values.q.trim();
  const isEmail = q.includes('@');
  const isPhone = /^[+\d][\d\s-]*$/.test(q);
  const roleId = Number(values.rol);
  const businessId = Number(values.propiedad);
  return {
    name: q && !isEmail && !isPhone ? q : undefined,
    email: isEmail ? q : undefined,
    phone: isPhone ? q.replace(/\D/g, '') : undefined,
    is_active: values.estado === 'activos' ? true : values.estado === 'inactivos' ? false : undefined,
    role_id: roleId > 0 ? roleId : undefined,
    business_id: businessId > 0 ? businessId : undefined,
  };
}

export function UsersPage() {
  const { values, setFilters: setUrlFilters } = useUrlFilters(FILTER_KEYS);
  const query = useMemo(() => usersQueryFromUrl(values), [values]);
  const { users, loading, error, totalPages, totalCount, loadUsers, setFilters, refresh } = useUsers({ initialFilters: query });

  const [token, setToken] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [businessOptions, setBusinessOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [formUser, setFormUser] = useState<UserRow | null>(null);
  const [rolesUser, setRolesUser] = useState<UserRow | null>(null);
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setUrlFilters({ q }));

  useEffect(() => {
    const authToken = TokenStorage.getBusinessToken();
    setToken(authToken);
    if (!authToken) return;
    loadUsers(authToken);
    getRolesAction(authToken, { page_size: 200 }).then((r) => {
      if (r.success && r.data) setRoleOptions(r.data.roles.map((role) => ({ value: String(role.id), label: role.name })));
    });
    getBusinessesAction({ token: authToken, page: 1, per_page: 200, name: '' }).then((r) => {
      if (r.success && r.data) setBusinessOptions(r.data.businesses.map((b) => ({ value: String(b.id), label: b.name })));
    });
    // Solo al montar: después recarga useUsers al cambiar filtros o página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La URL manda: cuando cambia un filtro, se lo pasa a useUsers (que vuelve a la página 1).
  const queryKey = JSON.stringify(query);
  const [appliedKey, setAppliedKey] = useState(queryKey);
  useEffect(() => {
    if (queryKey === appliedKey) return;
    setAppliedKey(queryKey);
    setFilters(query);
  }, [queryKey, appliedKey, query, setFilters]);

  const rows = users as UserRow[];
  const selected = rows.find((u) => u.id === selectedId) ?? null;

  const openEdit = (u: UserRow) => {
    setFormUser(u);
    setFormMode('edit');
  };
  const actions = useUserActions({
    onEdit: openEdit,
    onAssignRoles: setRolesUser,
    onChanged: refresh,
    onDeleted: (u) => setSelectedId((id) => (id === u.id ? null : id)),
  });

  if (!token) {
    return (
      <IamPage>
        <VtNotice>Inicia sesión para administrar los usuarios.</VtNotice>
      </IamPage>
    );
  }

  return (
    <IamPage>
      <IamPageHeader
        title="Usuarios"
        description="Quién entra a Rupü y qué puede hacer en cada propiedad."
        counts={{ '/iam/users': totalCount }}
        actions={
          <button
            type="button"
            className={vtBtn.primary}
            onClick={() => {
              setFormUser(null);
              setFormMode('create');
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Crear usuario
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <DsSearch value={search} onChange={setSearch} placeholder="Buscar por nombre, correo o celular" className="md:w-80" />
        <DsChips chips={STATUS_CHIPS} active={values.estado} onChange={(estado) => setUrlFilters({ estado })} ariaLabel="Estado" />
        <select aria-label="Filtrar por rol" className={dsSelect} value={values.rol} onChange={(e) => setUrlFilters({ rol: e.target.value })}>
          <option value="">Rol: todos</option>
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select aria-label="Filtrar por propiedad" className={dsSelect} value={values.propiedad} onChange={(e) => setUrlFilters({ propiedad: e.target.value })}>
          <option value="">Propiedad: todas</option>
          {businessOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {actions.noticeBar}
      {error && <VtNotice>No se pudieron cargar los usuarios: {error}</VtNotice>}

      <UsersTable
        users={rows}
        loading={loading}
        selectedId={selectedId}
        onSelect={(u) => setSelectedId(u.id)}
        menuItems={actions.menuItems}
        footer={<Pagination total={totalCount} totalPages={totalPages} disabled={loading} />}
      />

      <UserSidePanel
        user={selected}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onAssignRoles={setRolesUser}
        menuItems={actions.menuItems}
      />

      <UserForm
        isOpen={formMode !== null}
        mode={formMode ?? 'create'}
        user={formUser}
        onClose={() => setFormMode(null)}
        onSuccess={refresh}
      />

      <AssignRolesModal
        isOpen={!!rolesUser}
        onClose={() => setRolesUser(null)}
        user={rolesUser}
        onSuccess={refresh}
      />

      {actions.dialogs}
    </IamPage>
  );
}
