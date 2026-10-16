'use client';

/**
 * V2 · Nueva visita / Editar visita (Patrón B: modal de 560 px).
 * Crear: documento del visitante → si existe se usa; si no, nombre y teléfono para crearlo en
 * el mismo envío. Después unidad, tipo, día y horas, propósito y opciones.
 */

import { useEffect, useId, useState } from 'react';
import { VtDialog, VtNotice, VtSwitch, VtBadge, vtBtn, vtInput, vtLabel, vtTextarea, DS, dsMono } from '@/shared/ui/ds';
import {
  createVisitAction,
  createVisitorAction,
  getVisitTypesAction,
  searchVisitorAction,
  updateVisitAction,
} from '../infrastructure/actions';
import type { Visit, VisitType, Visitor } from '../domain';
import { UnitAutocomplete } from './unit-autocomplete';
import { useBusinessToken } from './use-business-token';
import { todayInProperty } from './visit-state';
import {
  emptyVisitForm,
  formToCreateDTO,
  formToUpdateDTO,
  validateVisitForm,
  visitToForm,
  type NewVisitorValues,
  type VisitFormValues,
} from './visit-form';

export interface VisitFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Se llama después de guardar con el texto de confirmación. */
  onSaved: (message: string) => void;
  businessId: number;
  /** Editar: la visita y el visitante que se muestra (no se cambia). */
  edit?: { visit: Visit; visitorName: string; visitorDni: string };
}

type Lookup = 'idle' | 'searching' | 'found' | 'not_found';

const emptyVisitor: NewVisitorValues = { dni: '', fullName: '', phone: '', email: '' };

export function VisitFormModal({ open, onClose, onSaved, businessId, edit }: VisitFormModalProps) {
  const getToken = useBusinessToken(businessId);
  const ids = { dni: useId(), name: useId(), phone: useId(), email: useId(), type: useId(), date: useId(), start: useId(), end: useId(), purpose: useId(), people: useId(), notes: useId() };

  const [form, setForm] = useState<VisitFormValues>(() => emptyVisitForm(todayInProperty()));
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [newVisitor, setNewVisitor] = useState<NewVisitorValues>(emptyVisitor);
  const [lookup, setLookup] = useState<Lookup>('idle');
  const [types, setTypes] = useState<VisitType[]>([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reinicia el formulario al abrir y carga tipos de visita + token (lo necesita el buscador de unidades)
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    setVisitor(null);
    setNewVisitor(emptyVisitor);
    setLookup('idle');
    setForm(edit ? visitToForm(edit.visit) : emptyVisitForm(todayInProperty()));
    let cancelled = false;
    (async () => {
      try {
        const t = await getToken();
        if (cancelled) return;
        setToken(t);
        const all = await getVisitTypesAction({ token: t });
        if (cancelled) return;
        const active = all.filter((x) => x.isActive);
        setTypes(active);
        if (!edit && active.length > 0) setForm((f) => (f.visitTypeId ? f : { ...f, visitTypeId: active[0].id }));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los tipos de visita');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, edit, getToken]);

  const set = <K extends keyof VisitFormValues>(k: K, v: VisitFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const searchVisitor = async () => {
    const dni = newVisitor.dni.trim();
    if (!dni) {
      setError('Escribe el documento del visitante');
      return;
    }
    setError(null);
    setLookup('searching');
    try {
      const t = await getToken();
      const found = await searchVisitorAction({ businessId, dni, token: t });
      setVisitor(found);
      setLookup('found');
    } catch {
      setVisitor(null);
      setLookup('not_found');
    }
  };

  const submit = async () => {
    const problem = validateVisitForm(form, {
      hasVisitor: !!edit || !!visitor,
      needsNewVisitor: lookup === 'not_found',
      visitor: newVisitor,
    });
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const t = await getToken();
      if (edit) {
        await updateVisitAction({ businessId, visitId: edit.visit.id, data: formToUpdateDTO(form), token: t });
        onSaved('Visita actualizada');
        return;
      }
      let v = visitor;
      if (!v) {
        v = await createVisitorAction({
          businessId,
          data: {
            dni: newVisitor.dni.trim(),
            fullName: newVisitor.fullName.trim(),
            phone: newVisitor.phone.trim(),
            email: newVisitor.email.trim() || undefined,
          },
          token: t,
        });
      }
      if (!v?.id) throw new Error('El visitante no tiene un id válido; vuelve a buscarlo');
      await createVisitAction({ businessId, data: formToCreateDTO(form, v.id), token: t });
      onSaved(`Visita de ${v.fullName} registrada`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la visita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow={edit ? 'Editar visita' : 'Visitas'}
      title={edit ? edit.visitorName : 'Nueva visita'}
      subtitle={edit ? `Documento ${edit.visitorDni}` : 'Registra quién viene, a qué unidad y cuándo'}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className={vtBtn.primary} onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : edit ? 'Guardar cambios' : 'Registrar visita'}
          </button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}

        {!edit && (
          <fieldset className="flex flex-col gap-3 m-0 p-0 border-0">
            <legend className={`${dsMono} text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580] mb-2`}>Visitante</legend>
            {lookup === 'found' && visitor ? (
              <div className="flex items-center gap-3 rounded-lg border border-[#e4e2dd] px-3.5 py-3">
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-semibold shrink-0" aria-hidden="true">
                  {visitor.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{visitor.fullName}</div>
                  <div className={`${dsMono} text-[11px] text-[#8a8580]`}>
                    {visitor.dni}
                    {visitor.phone ? ` · ${visitor.phone}` : ''}
                    {visitor.totalVisits ? ` · ${visitor.totalVisits} visitas` : ''}
                  </div>
                </div>
                {visitor.hasBlacklist && <VtBadge label="Lista negra" bg={DS.missingBg} fg={DS.no} />}
                <button
                  type="button"
                  className={vtBtn.small}
                  onClick={() => {
                    setVisitor(null);
                    setLookup('idle');
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor={ids.dni} className={vtLabel}>
                    Documento <span aria-hidden="true">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={ids.dni}
                      className={`${vtInput} ${dsMono}`}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="1234567890"
                      value={newVisitor.dni}
                      onChange={(e) => {
                        setNewVisitor({ ...newVisitor, dni: e.target.value });
                        if (lookup === 'not_found') setLookup('idle');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchVisitor();
                        }
                      }}
                    />
                    <button type="button" className={`${vtBtn.secondary} shrink-0`} onClick={searchVisitor} disabled={lookup === 'searching'}>
                      {lookup === 'searching' ? 'Buscando…' : 'Buscar'}
                    </button>
                  </div>
                </div>
                {lookup === 'not_found' && (
                  <>
                    <VtNotice tone="info">No hay un visitante con ese documento. Completa sus datos para registrarlo.</VtNotice>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label htmlFor={ids.name} className={vtLabel}>
                          Nombre completo <span aria-hidden="true">*</span>
                        </label>
                        <input id={ids.name} className={vtInput} value={newVisitor.fullName} onChange={(e) => setNewVisitor({ ...newVisitor, fullName: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor={ids.phone} className={vtLabel}>
                          Teléfono <span aria-hidden="true">*</span>
                        </label>
                        <input id={ids.phone} className={vtInput} inputMode="tel" value={newVisitor.phone} onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor={ids.email} className={vtLabel}>
                          Correo
                        </label>
                        <input id={ids.email} type="email" className={vtInput} value={newVisitor.email} onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-3 m-0 p-0 border-0">
          <legend className={`${dsMono} text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580] mb-2`}>Visita</legend>
          {token ? (
            <UnitAutocomplete value={form.propertyUnitId} onChange={(id) => set('propertyUnitId', id)} businessId={businessId} token={token} required label="Unidad" />
          ) : (
            <div className="h-10" aria-hidden="true" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor={ids.type} className={vtLabel}>
                Tipo <span aria-hidden="true">*</span>
              </label>
              <select id={ids.type} className={vtInput} value={form.visitTypeId ?? ''} onChange={(e) => set('visitTypeId', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">{types.length ? 'Elige un tipo' : 'Cargando…'}</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label htmlFor={ids.people} className={vtLabel}>
                Personas
              </label>
              <input
                id={ids.people}
                type="number"
                min={1}
                max={50}
                className={`${vtInput} ${dsMono}`}
                value={form.numberOfVisitors}
                onChange={(e) => set('numberOfVisitors', Number.parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label htmlFor={ids.date} className={vtLabel}>
                Día <span aria-hidden="true">*</span>
              </label>
              <input id={ids.date} type="date" className={`${vtInput} ${dsMono}`} value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div className="col-span-1 md:col-span-1 grid grid-cols-2 gap-2 max-md:col-span-2">
              <div>
                <label htmlFor={ids.start} className={vtLabel}>
                  Llega <span aria-hidden="true">*</span>
                </label>
                <input id={ids.start} type="time" className={`${vtInput} ${dsMono} px-2`} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </div>
              <div>
                <label htmlFor={ids.end} className={vtLabel}>
                  Sale
                </label>
                <input id={ids.end} type="time" className={`${vtInput} ${dsMono} px-2`} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor={ids.purpose} className={vtLabel}>
              Motivo
            </label>
            <input id={ids.purpose} className={vtInput} placeholder="Visita familiar, domicilio, mantenimiento…" value={form.purpose} onChange={(e) => set('purpose', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg bg-[#f5f5f4] px-3.5 py-3">
            {!edit && <SwitchRow label="Trae acompañantes" checked={form.hasCompanions} onChange={(v) => set('hasCompanions', v)} />}
            {!edit && <SwitchRow label="Ingresa equipos" checked={form.hasAssets} onChange={(v) => set('hasAssets', v)} />}
            <SwitchRow label="Avisar al residente" checked={form.notifyResident} onChange={(v) => set('notifyResident', v)} />
            <SwitchRow label="Avisar a seguridad" checked={form.notifySecurity} onChange={(v) => set('notifySecurity', v)} />
          </div>
          <div>
            <label htmlFor={ids.notes} className={vtLabel}>
              Notas
            </label>
            <textarea id={ids.notes} rows={2} className={vtTextarea} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </fieldset>
        {/* Enter en un campo envía el formulario */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </VtDialog>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px]">{label}</span>
      <VtSwitch label={label} checked={checked} onChange={onChange} />
    </div>
  );
}
