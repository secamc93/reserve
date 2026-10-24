/**
 * Avanzado › Tipos de negocio (rediseño IAM): clasifican las propiedades y filtran qué roles,
 * módulos y permisos aplican a cada una. Hoy el producto es solo propiedad horizontal, así que
 * normalmente hay uno.
 */

'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import { DsConfirmDialog, DsTable, VtDialog, VtMenu, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel, vtTextarea, type DsColumn } from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import {
  createBusinessTypeAction,
  deleteBusinessTypeAction,
  getBusinessTypesAction,
  updateBusinessTypeAction,
} from '../../infrastructure/actions';
import type { BusinessType } from '../../domain/entities';

/** Código a partir del nombre: "Propiedad Horizontal" → "propiedad_horizontal". */
export function businessTypeCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function BusinessTypeFormDialog({
  open,
  type,
  onClose,
  onSaved,
}: {
  open: boolean;
  type: BusinessType | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const token = TokenStorage.getBusinessToken() ?? '';
  const ids = { name: useId(), code: useId(), desc: useId(), icon: useId() };
  const [form, setForm] = useState({ name: '', code: '', description: '', icon: '', is_active: true });
  const [codeTouched, setCodeTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCodeTouched(!!type);
    setForm(type ? { name: type.name, code: type.code, description: type.description ?? '', icon: type.icon ?? '', is_active: type.is_active } : { name: '', code: '', description: '', icon: '', is_active: true });
  }, [open, type]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError('Escribe el nombre y el código.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { name: form.name.trim(), code: form.code.trim(), description: form.description.trim(), icon: form.icon.trim(), is_active: form.is_active };
    const r = type ? await updateBusinessTypeAction({ ...payload, id: type.id, token }) : await createBusinessTypeAction({ ...payload, token });
    setSaving(false);
    if (!r.success) {
      setError(r.error ?? 'No se pudo guardar el tipo de negocio');
      return;
    }
    onSaved(type ? `Tipo "${payload.name}" actualizado.` : `Tipo "${payload.name}" creado.`);
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Tipo de negocio"
      title={type ? 'Editar tipo de negocio' : 'Nuevo tipo de negocio'}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form="business-type-form" className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : type ? 'Guardar cambios' : 'Crear tipo'}
          </button>
        </>
      }
    >
      <form id="business-type-form" onSubmit={submit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor={ids.name} className={vtLabel}>Nombre</label>
          <input
            id={ids.name}
            className={vtInput}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, code: codeTouched ? f.code : businessTypeCode(e.target.value) }))}
          />
        </div>
        <div>
          <label htmlFor={ids.code} className={vtLabel}>Código</label>
          <input
            id={ids.code}
            className={`${vtInput} ${dsMono}`}
            value={form.code}
            onChange={(e) => {
              setCodeTouched(true);
              setForm((f) => ({ ...f, code: e.target.value }));
            }}
          />
          {type && <p className="mt-1 mb-0 text-xs text-[#6b6660]">El sistema busca algunos tipos por su código (p. ej. horizontal_property).</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ids.desc} className={vtLabel}>
            Descripción <span className="font-normal text-[#6b6660]">(opcional)</span>
          </label>
          <textarea id={ids.desc} rows={2} className={vtTextarea} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label htmlFor={ids.icon} className={vtLabel}>
            Ícono <span className="font-normal text-[#6b6660]">(opcional)</span>
          </label>
          <input id={ids.icon} className={vtInput} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="building" />
        </div>
        <div className="flex items-end">
          <div className="w-full flex items-center justify-between gap-3 rounded-xl border border-[#e4e2dd] px-3.5 h-10 max-md:h-11">
            <span className="text-sm font-medium">Activo</span>
            <VtSwitch checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Tipo activo" />
          </div>
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

export function BusinessTypesAdminPage() {
  const token = TokenStorage.getBusinessToken() ?? '';
  const [types, setTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState<BusinessType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BusinessType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const r = await getBusinessTypesAction({ token });
    if (r.success && r.data) {
      setTypes([...r.data.businessTypes].sort((a, b) => a.name.localeCompare(b.name, 'es')));
      setError(null);
    } else {
      setError(r.error ?? 'No se pudieron cargar los tipos de negocio');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (t: BusinessType, next: boolean) => {
    setTogglingId(t.id);
    const r = await updateBusinessTypeAction({ id: t.id, is_active: next, token });
    setTogglingId(null);
    if (!r.success) {
      setNotice({ ok: false, text: r.error ?? 'No se pudo cambiar el estado' });
      return;
    }
    setTypes((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_active: next } : x)));
  };

  const columns: DsColumn<BusinessType>[] = [
    {
      key: 'name',
      label: 'Tipo',
      width: 'minmax(200px, 1.2fr)',
      render: (t) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold truncate">{t.name}</span>
          <span className={`${dsMono} text-[11px] text-[#6b6660] truncate`}>{t.code}</span>
        </div>
      ),
    },
    { key: 'desc', label: 'Descripción', width: 'minmax(220px, 1.6fr)', render: (t) => <span className="text-[13px] text-[#4b4a46] truncate">{t.description || '—'}</span> },
    {
      key: 'active',
      label: 'Activo',
      width: '90px',
      render: (t) => <VtSwitch checked={t.is_active} onChange={(v) => toggleActive(t, v)} label={`${t.name} activo`} disabled={togglingId !== null} busy={togglingId === t.id} />,
    },
    {
      key: 'menu',
      label: (
        <span className="relative">
          <span className="sr-only">Acciones</span>
        </span>
      ),
      width: '44px',
      align: 'right',
      render: (t) => (
        <VtMenu
          label={`Acciones de ${t.name}`}
          size={32}
          items={[
            { label: 'Editar', onSelect: () => { setEditing(t); setFormOpen(true); } },
            { label: 'Eliminar', danger: true, onSelect: () => { setDeleteError(null); setToDelete(t); } },
          ]}
        />
      ),
    },
  ];

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const r = await deleteBusinessTypeAction({ id: toDelete.id, token });
    setDeleting(false);
    if (!r.success) {
      setDeleteError(r.error ?? 'No se pudo eliminar el tipo de negocio');
      return;
    }
    setNotice({ ok: true, text: `Tipo "${toDelete.name}" eliminado.` });
    setToDelete(null);
    load();
  };

  return (
    <IamPage>
      <IamPageHeader
        title="Tipos de negocio"
        description="Clasifican las propiedades y filtran qué roles, módulos y permisos aplican a cada una."
        actions={
          <button type="button" className={vtBtn.primary} onClick={() => { setEditing(null); setFormOpen(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo tipo
          </button>
        }
      />

      {notice && <VtNotice tone={notice.ok ? 'ok' : 'error'}>{notice.text}</VtNotice>}
      {error && <VtNotice>{error}</VtNotice>}

      <DsTable ariaLabel="Tipos de negocio" columns={columns} rows={types} rowKey={(t) => t.id} loading={loading} minWidth={620} empty="Aún no hay tipos de negocio." />

      <BusinessTypeFormDialog
        open={formOpen}
        type={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => {
          setFormOpen(false);
          setNotice({ ok: true, text: msg });
          load();
        }}
      />
      <DsConfirmDialog
        open={!!toDelete}
        title="Eliminar tipo de negocio"
        message={`Se elimina "${toDelete?.name}". Las propiedades, roles y permisos de este tipo pueden dejar de funcionar.`}
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </IamPage>
  );
}
