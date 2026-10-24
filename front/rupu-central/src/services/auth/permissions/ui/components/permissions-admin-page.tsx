/**
 * Avanzado › Permisos (rediseño IAM): el catálogo de permisos agrupado por módulo, con filtros
 * en la URL (?q=&accion=&tipo=) y un diálogo para crear o editar. Cada permiso es una acción sobre
 * un recurso; los roles los agrupan en Roles y permisos.
 */

'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import {
  DsChips,
  DsConfirmDialog,
  DsGroupedTable,
  DsSearch,
  VtDialog,
  VtMenu,
  VtNotice,
  dsSelect,
  useDebouncedValue,
  useUrlFilters,
  vtBtn,
  vtInput,
  vtLabel,
  vtTextarea,
  type DsColumn,
} from '@shared/ui/ds';
import { actionLabel } from '@/services/auth/roles/domain/entities/permission-matrix.entity';
import { getActionsAction } from '@/services/auth/actions/infrastructure/actions';
import { getResourcesAction } from '@/services/auth/resources/infrastructure/actions';
import { getBusinessTypesAction } from '@/services/auth/business-types/infrastructure/actions';
import {
  createPermissionAction,
  deletePermissionAction,
  getPermissionsListAction,
  updatePermissionAction,
  type GetPermissionsListResult,
} from '../../infrastructure/actions';

type PermissionRow = NonNullable<GetPermissionsListResult['data']>['permissions'][number];
interface Option {
  id: number;
  name: string;
}

const FILTER_KEYS = ['q', 'accion', 'tipo'] as const;

/** Ámbitos del back (tabla `scope`): plataforma = 1, negocio = 2. */
const SCOPES: Option[] = [
  { id: 2, name: 'Propiedad' },
  { id: 1, name: 'Plataforma' },
];

export function scopeLabel(scopeCode: string, scopeName: string): string {
  if (scopeCode === 'platform') return 'Plataforma';
  if (scopeCode === 'business') return 'Propiedad';
  return scopeName;
}

/** Catálogos para los selects del formulario (recursos, acciones y tipos de negocio). */
function useCatalogs(token: string, enabled: boolean) {
  const [resources, setResources] = useState<(Option & { businessTypeId?: number })[]>([]);
  const [actions, setActions] = useState<Option[]>([]);
  const [types, setTypes] = useState<Option[]>([]);
  useEffect(() => {
    if (!enabled || !token) return;
    getResourcesAction({ token, page: 1, pageSize: 200 }).then((r) => {
      if (r.success && r.data) setResources(r.data.resources.map((x) => ({ id: x.id, name: x.name, businessTypeId: x.business_type_id })));
    });
    getActionsAction({ token, page: 1, page_size: 200 }).then((r) => {
      if (r.success && r.data) setActions(r.data.actions.map((x) => ({ id: x.id, name: x.name })));
    });
    getBusinessTypesAction({ token }).then((r) => {
      if (r.success && r.data) setTypes(r.data.businessTypes.map((x) => ({ id: x.id, name: x.name })));
    });
  }, [token, enabled]);
  return { resources, actions, types };
}

function PermissionFormDialog({
  open,
  permission,
  onClose,
  onSaved,
}: {
  open: boolean;
  permission: PermissionRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const token = TokenStorage.getBusinessToken() ?? '';
  const ids = { name: useId(), desc: useId(), resource: useId(), action: useId(), scope: useId(), type: useId() };
  const { resources, actions, types } = useCatalogs(token, open);
  const [form, setForm] = useState({ name: '', description: '', resourceId: '', actionId: '', scopeId: '2', businessTypeId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      permission
        ? {
            name: permission.name,
            description: permission.description ?? '',
            resourceId: String(permission.resourceId),
            actionId: String(permission.actionId),
            scopeId: String(permission.scopeId),
            businessTypeId: permission.businessTypeId ? String(permission.businessTypeId) : '',
          }
        : { name: '', description: '', resourceId: '', actionId: '', scopeId: '2', businessTypeId: '' },
    );
  }, [open, permission]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Al elegir recurso y acción se propone el nombre ("Editar Visitas") si el usuario no escribió uno.
  const pickResource = (v: string) => {
    const r = resources.find((x) => String(x.id) === v);
    setForm((f) => ({
      ...f,
      resourceId: v,
      businessTypeId: f.businessTypeId || (r?.businessTypeId ? String(r.businessTypeId) : ''),
      name: f.name || suggestName(actions.find((a) => String(a.id) === f.actionId)?.name, r?.name),
    }));
  };
  const pickAction = (v: string) => {
    const a = actions.find((x) => String(x.id) === v);
    setForm((f) => ({ ...f, actionId: v, name: f.name || suggestName(a?.name, resources.find((r) => String(r.id) === f.resourceId)?.name) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.resourceId || !form.actionId) {
      setError('Completa el nombre, el recurso y la acción.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      resource_id: Number(form.resourceId),
      action_id: Number(form.actionId),
      scope_id: Number(form.scopeId),
      business_type_id: form.businessTypeId ? Number(form.businessTypeId) : undefined,
    };
    const r = permission ? await updatePermissionAction({ ...payload, id: permission.id, token }) : await createPermissionAction(payload, token);
    setSaving(false);
    if (!r.success) {
      setError(r.error ?? 'No se pudo guardar el permiso');
      return;
    }
    onSaved(permission ? `Permiso "${payload.name}" actualizado.` : `Permiso "${payload.name}" creado.`);
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Permiso"
      title={permission ? 'Editar permiso' : 'Nuevo permiso'}
      subtitle="Una acción sobre un módulo. Después se agrega a los roles que la necesiten."
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form="permission-form" className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : permission ? 'Guardar cambios' : 'Crear permiso'}
          </button>
        </>
      }
    >
      <form id="permission-form" onSubmit={submit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor={ids.resource} className={vtLabel}>Módulo (recurso)</label>
          <select id={ids.resource} className={vtInput} value={form.resourceId} onChange={(e) => pickResource(e.target.value)}>
            <option value="">Elige un módulo</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.action} className={vtLabel}>Acción</label>
          <select id={ids.action} className={vtInput} value={form.actionId} onChange={(e) => pickAction(e.target.value)}>
            <option value="">Elige una acción</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>{actionLabel(a.name)}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ids.name} className={vtLabel}>Nombre</label>
          <input id={ids.name} className={vtInput} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ids.desc} className={vtLabel}>
            Descripción <span className="font-normal text-[#6b6660]">(opcional)</span>
          </label>
          <textarea id={ids.desc} rows={2} className={vtTextarea} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label htmlFor={ids.scope} className={vtLabel}>Ámbito</label>
          <select id={ids.scope} className={vtInput} value={form.scopeId} onChange={(e) => set('scopeId', e.target.value)}>
            {SCOPES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.type} className={vtLabel}>Tipo de negocio</label>
          <select id={ids.type} className={vtInput} value={form.businessTypeId} onChange={(e) => set('businessTypeId', e.target.value)}>
            <option value="">Todos (genérico)</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {error && (
          <div className="md:col-span-2">
            <VtNotice>{error}</VtNotice>
          </div>
        )}
      </form>
    </VtDialog>
  );
}

function suggestName(action?: string, resource?: string): string {
  return action && resource ? `${actionLabel(action)} ${resource}` : '';
}

export function PermissionsAdminPage() {
  const token = TokenStorage.getBusinessToken() ?? '';
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<PermissionRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<PermissionRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getPermissionsListAction(token);
    if (r.success && r.data) {
      setPermissions(r.data.permissions);
      setError(null);
    } else {
      setError(r.error ?? 'No se pudieron cargar los permisos');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const actionChips = useMemo(() => {
    const names = [...new Set(permissions.map((p) => p.action))];
    const order = ['Read', 'Create', 'Update', 'Delete'];
    names.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));
    return [{ id: '', label: 'Todas' }, ...names.map((n) => ({ id: n, label: actionLabel(n) }))];
  }, [permissions]);

  const typeOptions = useMemo(() => {
    const m = new Map<string, string>();
    permissions.forEach((p) => p.businessTypeId && m.set(String(p.businessTypeId), p.businessTypeName ?? `Tipo ${p.businessTypeId}`));
    return [...m.entries()];
  }, [permissions]);

  const groups = useMemo(() => {
    const q = values.q.trim().toLowerCase();
    const filtered = permissions.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q) || p.resource.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)) &&
        (!values.accion || p.action === values.accion) &&
        (!values.tipo || String(p.businessTypeId ?? '') === values.tipo),
    );
    const byResource = new Map<string, PermissionRow[]>();
    filtered.forEach((p) => byResource.set(p.resource, [...(byResource.get(p.resource) ?? []), p]));
    return [...byResource.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([resource, rows]) => ({
        key: resource,
        label: resource,
        right: rows.length === 1 ? '1 permiso' : `${rows.length} permisos`,
        rows,
      }));
  }, [permissions, values]);

  const shown = groups.reduce((n, g) => n + g.rows.length, 0);

  const columns: DsColumn<PermissionRow>[] = [
    {
      key: 'name',
      label: 'Permiso',
      width: 'minmax(200px, 1.4fr)',
      render: (p) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{p.name}</span>
          {p.description && <span className="text-xs text-[#6b6660] truncate">{p.description}</span>}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Acción',
      width: '110px',
      render: (p) => <span className="px-2.5 py-[3px] rounded-md bg-[#E3F5F5] text-[#0C6B76] text-xs font-semibold">{actionLabel(p.action)}</span>,
    },
    { key: 'scope', label: 'Ámbito', width: '110px', render: (p) => <span className="text-[13px] text-[#4b4a46]">{scopeLabel(p.scopeCode, p.scopeName)}</span> },
    { key: 'type', label: 'Tipo de negocio', width: 'minmax(140px, 1fr)', render: (p) => <span className="text-[13px] text-[#4b4a46] truncate">{p.businessTypeName || 'Genérico'}</span> },
    {
      key: 'menu',
      label: (
        <span className="relative">
          <span className="sr-only">Acciones</span>
        </span>
      ),
      width: '44px',
      align: 'right',
      render: (p) => (
        <VtMenu
          label={`Acciones de ${p.name}`}
          size={32}
          items={[
            { label: 'Editar', onSelect: () => { setEditing(p); setFormOpen(true); } },
            { label: 'Eliminar', danger: true, onSelect: () => { setDeleteError(null); setToDelete(p); } },
          ]}
        />
      ),
    },
  ];

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const r = await deletePermissionAction({ id: toDelete.id, token });
    setDeleting(false);
    if (!r.success) {
      setDeleteError(r.error ?? 'No se pudo eliminar el permiso');
      return;
    }
    setNotice(`Permiso "${toDelete.name}" eliminado.`);
    setToDelete(null);
    load();
  };

  return (
    <IamPage>
      <IamPageHeader
        title="Permisos"
        description="Cada permiso es una acción sobre un módulo. Los roles los agrupan en Roles y permisos."
        actions={
          <button type="button" className={vtBtn.primary} onClick={() => { setEditing(null); setFormOpen(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo permiso
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <DsSearch value={search} onChange={setSearch} placeholder="Buscar permiso o módulo" className="md:w-72" />
        <DsChips chips={actionChips} active={values.accion} onChange={(accion) => setFilters({ accion })} ariaLabel="Acción" />
        {typeOptions.length > 0 && (
          <select aria-label="Filtrar por tipo de negocio" className={dsSelect} value={values.tipo} onChange={(e) => setFilters({ tipo: e.target.value })}>
            <option value="">Tipo: todos</option>
            {typeOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
      </div>

      {notice && <VtNotice tone="ok">{notice}</VtNotice>}
      {error && <VtNotice>{error}</VtNotice>}

      <DsGroupedTable
        ariaLabel="Permisos"
        columns={columns}
        groups={groups}
        rowKey={(p) => p.id}
        loading={loading}
        minWidth={720}
        empty="No hay permisos con estos filtros."
        footer={<span className="text-xs text-[#6b6660]">{shown} de {permissions.length} permisos</span>}
      />

      <PermissionFormDialog
        open={formOpen}
        permission={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => {
          setFormOpen(false);
          setNotice(msg);
          load();
        }}
      />
      <DsConfirmDialog
        open={!!toDelete}
        title="Eliminar permiso"
        message={`Se elimina "${toDelete?.name}" y los roles que lo tengan lo pierden.`}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </IamPage>
  );
}
