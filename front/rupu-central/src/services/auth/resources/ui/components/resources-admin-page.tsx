/**
 * Avanzado › Recursos (rediseño IAM): los módulos de Rupü a los que se aplican los permisos, con
 * las acciones que ya tienen definidas. Búsqueda y tipo en la URL (?q=&tipo=), paginación en
 * ?page=&page_size=.
 */

'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import {
  DsConfirmDialog,
  DsSearch,
  DsTable,
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
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { actionLabel } from '@/services/auth/roles/domain/entities/permission-matrix.entity';
import { getPermissionsListAction } from '@/services/auth/permissions/infrastructure/actions';
import { getBusinessTypesAction } from '@/services/auth/business-types/infrastructure/actions';
import {
  createResourceAction,
  deleteResourceAction,
  getResourcesAction,
  updateResourceAction,
  type GetResourcesResult,
} from '../../infrastructure/actions';

type ResourceRow = NonNullable<GetResourcesResult['data']>['resources'][number];

const FILTER_KEYS = ['q', 'tipo'] as const;

function ResourceFormDialog({
  open,
  resource,
  types,
  onClose,
  onSaved,
}: {
  open: boolean;
  resource: ResourceRow | null;
  types: { id: number; name: string }[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const token = TokenStorage.getBusinessToken() ?? '';
  const ids = { name: useId(), desc: useId(), type: useId() };
  const [form, setForm] = useState({ name: '', description: '', businessTypeId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      resource
        ? { name: resource.name, description: resource.description ?? '', businessTypeId: resource.business_type_id ? String(resource.business_type_id) : '' }
        : { name: '', description: '', businessTypeId: types.length === 1 ? String(types[0].id) : '' },
    );
  }, [open, resource, types]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Escribe el nombre del módulo.');
      return;
    }
    setSaving(true);
    setError(null);
    const base = { token, name: form.name.trim(), description: form.description.trim() };
    const typeId = form.businessTypeId ? Number(form.businessTypeId) : undefined;
    const r = resource
      ? await updateResourceAction({ ...base, id: resource.id, business_type_id: typeId ?? null })
      : await createResourceAction({ ...base, business_type_id: typeId });
    setSaving(false);
    if (!r.success) {
      setError(r.error ?? 'No se pudo guardar el módulo');
      return;
    }
    onSaved(resource ? `Módulo "${base.name}" actualizado.` : `Módulo "${base.name}" creado. Ahora crea sus permisos en Permisos.`);
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Recurso"
      title={resource ? 'Editar módulo' : 'Nuevo módulo'}
      subtitle="Los permisos se definen sobre módulos (Visitas, Votaciones…)."
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form="resource-form" className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : resource ? 'Guardar cambios' : 'Crear módulo'}
          </button>
        </>
      }
    >
      <form id="resource-form" onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor={ids.name} className={vtLabel}>Nombre</label>
          <input id={ids.name} className={vtInput} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          {resource && <p className="mt-1 mb-0 text-xs text-[#6b6660]">El front reconoce algunos módulos por su nombre (p. ej. "Votaciones"): cambiarlo puede ocultar opciones.</p>}
        </div>
        <div>
          <label htmlFor={ids.desc} className={vtLabel}>
            Descripción <span className="font-normal text-[#6b6660]">(opcional)</span>
          </label>
          <textarea id={ids.desc} rows={2} className={vtTextarea} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label htmlFor={ids.type} className={vtLabel}>Tipo de negocio</label>
          <select id={ids.type} className={vtInput} value={form.businessTypeId} onChange={(e) => setForm((f) => ({ ...f, businessTypeId: e.target.value }))}>
            <option value="">Todos (genérico)</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {error && <VtNotice>{error}</VtNotice>}
      </form>
    </VtDialog>
  );
}

export function ResourcesAdminPage() {
  const token = TokenStorage.getBusinessToken() ?? '';
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const { page, pageSize } = usePaginationParams();
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const [actionsByResource, setActionsByResource] = useState<Record<number, string[]>>({});
  const [editing, setEditing] = useState<ResourceRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ResourceRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const typeId = Number(values.tipo) > 0 ? Number(values.tipo) : undefined;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const [res, perms] = await Promise.all([
      getResourcesAction({ token, page, pageSize, name: values.q || undefined, business_type_id: typeId, sortBy: 'name', sortOrder: 'asc' }),
      getPermissionsListAction(token),
    ]);
    if (res.success && res.data) {
      setRows(res.data.resources);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setError(null);
    } else {
      setError(res.error ?? 'No se pudieron cargar los módulos');
    }
    if (perms.success && perms.data) {
      const map: Record<number, string[]> = {};
      perms.data.permissions.forEach((p) => {
        map[p.resourceId] = [...new Set([...(map[p.resourceId] ?? []), p.action])];
      });
      setActionsByResource(map);
    }
    setLoading(false);
  }, [token, page, pageSize, values.q, typeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    getBusinessTypesAction({ token }).then((r) => {
      if (r.success && r.data) setTypes(r.data.businessTypes.map((t) => ({ id: t.id, name: t.name })));
    });
  }, [token]);

  const order = useMemo(() => ['Read', 'Create', 'Update', 'Delete'], []);

  const columns: DsColumn<ResourceRow>[] = [
    {
      key: 'name',
      label: 'Módulo',
      width: 'minmax(200px, 1.3fr)',
      render: (r) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold truncate">{r.name}</span>
          {r.description && <span className="text-xs text-[#6b6660] truncate">{r.description}</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones definidas',
      width: 'minmax(200px, 1.2fr)',
      render: (r) => {
        const acts = (actionsByResource[r.id] ?? []).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
        return acts.length === 0 ? (
          <span className="text-xs text-[#b5532f] font-medium">Sin permisos: ningún rol puede usarlo</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {acts.map((a) => (
              <span key={a} className="px-2 py-0.5 rounded-md bg-[#E3F5F5] text-[#0C6B76] text-[11px] font-semibold">{actionLabel(a)}</span>
            ))}
          </div>
        );
      },
    },
    { key: 'type', label: 'Tipo de negocio', width: 'minmax(140px, 0.8fr)', render: (r) => <span className="text-[13px] text-[#4b4a46] truncate">{r.business_type_name || 'Genérico'}</span> },
    {
      key: 'menu',
      label: (
        <span className="relative">
          <span className="sr-only">Acciones</span>
        </span>
      ),
      width: '44px',
      align: 'right',
      render: (r) => (
        <VtMenu
          label={`Acciones de ${r.name}`}
          size={32}
          items={[
            { label: 'Editar', onSelect: () => { setEditing(r); setFormOpen(true); } },
            { label: 'Eliminar', danger: true, onSelect: () => { setDeleteError(null); setToDelete(r); } },
          ]}
        />
      ),
    },
  ];

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const r = await deleteResourceAction({ id: toDelete.id, token });
    setDeleting(false);
    if (!r.success) {
      setDeleteError(r.error ?? 'No se pudo eliminar el módulo');
      return;
    }
    setNotice(`Módulo "${toDelete.name}" eliminado.`);
    setToDelete(null);
    load();
  };

  return (
    <IamPage>
      <IamPageHeader
        title="Recursos"
        description="Los módulos de Rupü a los que se aplican los permisos."
        actions={
          <button type="button" className={vtBtn.primary} onClick={() => { setEditing(null); setFormOpen(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo módulo
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <DsSearch value={search} onChange={setSearch} placeholder="Buscar módulo" className="md:w-72" />
        {types.length > 1 && (
          <select aria-label="Filtrar por tipo de negocio" className={dsSelect} value={values.tipo} onChange={(e) => setFilters({ tipo: e.target.value })}>
            <option value="">Tipo: todos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {notice && <VtNotice tone="ok">{notice}</VtNotice>}
      {error && <VtNotice>{error}</VtNotice>}

      <DsTable
        ariaLabel="Recursos"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        minWidth={680}
        empty="No hay módulos con estos filtros."
        footer={<Pagination total={total} totalPages={totalPages} disabled={loading} />}
      />

      <ResourceFormDialog
        open={formOpen}
        resource={editing}
        types={types}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => {
          setFormOpen(false);
          setNotice(msg);
          load();
        }}
      />
      <DsConfirmDialog
        open={!!toDelete}
        title="Eliminar módulo"
        message={`Se elimina "${toDelete?.name}" con sus permisos: los roles que los tengan los pierden.`}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </IamPage>
  );
}
