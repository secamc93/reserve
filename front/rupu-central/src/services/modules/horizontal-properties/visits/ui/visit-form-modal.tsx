'use client';

/**
 * V2 · Nueva visita (modal de 620 px en 3 pasos) y editar visita (solo el paso 2).
 *  1. Visitante: documento → visitante existente (tarjeta con historial) o datos para crearlo.
 *  2. ¿A qué unidad y para qué?: unidad (con sus residentes) y sugeridas por historial, tipo en
 *     tarjetas con su regla, fecha / desde / personas y opciones.
 *  3. Vehículo: placa, marca y color.
 * "Guardar y registrar entrada" crea la visita y registra la entrada de una vez.
 */

import { useEffect, useId, useState } from 'react';
import { VtDialog, VtNotice, VtBadge, vtBtn, vtInput, vtLabel, DS, dsMono } from '@/shared/ui/ds';
import {
  createVisitAction,
  createVisitorAction,
  createVisitorVehicleAction,
  getVisitTypesAction,
  getVisitsAction,
  registerEntryAction,
  searchVisitorAction,
  updateVisitAction,
} from '../infrastructure/actions';
import type { Visit, VisitType, Visitor } from '../domain';
import { getResidentsAction } from '@/services/modules/horizontal-properties/residents/infrastructure/actions';
import { UnitAutocomplete } from './unit-autocomplete';
import { useBusinessToken } from './use-business-token';
import { formatDoc, initials, todayInProperty } from './visit-state';
import {
  emptyVisitForm,
  formToCreateDTO,
  formToUpdateDTO,
  normalizePlate,
  validateVehicleStep,
  validateVisitStep,
  validateVisitorStep,
  visitToForm,
  visitTypeRule,
  visitorHistory,
  type NewVisitorValues,
  type VisitFormValues,
  type VisitorHistory,
} from './visit-form';

export interface VisitFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Se llama después de guardar con el texto de confirmación. */
  onSaved: (message: string) => void;
  businessId: number;
  /** Editar: la visita y el visitante que se muestra (no se cambia). */
  edit?: { visit: Visit; visitorName: string; visitorDni: string };
  /** Visita no programada (llega ahora): día de hoy y hora actual. */
  unscheduled?: boolean;
}

type Step = 1 | 2 | 3;
type Lookup = 'idle' | 'searching' | 'found' | 'not_found';

const TITLES: Record<Step, string> = { 1: '¿Quién viene?', 2: '¿A qué unidad y para qué?', 3: '¿Viene en vehículo?' };
const emptyVisitor: NewVisitorValues = { dni: '', fullName: '', phone: '', email: '' };

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function VisitFormModal({ open, onClose, onSaved, businessId, edit, unscheduled = false }: VisitFormModalProps) {
  const getToken = useBusinessToken(businessId);
  const ids = { dni: useId(), name: useId(), phone: useId(), email: useId(), date: useId(), start: useId(), purpose: useId(), plate: useId(), brand: useId(), color: useId() };

  const [step, setStep] = useState<Step>(edit ? 2 : 1);
  const [form, setForm] = useState<VisitFormValues>(() => emptyVisitForm(todayInProperty()));
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [history, setHistory] = useState<VisitorHistory | null>(null);
  const [newVisitor, setNewVisitor] = useState<NewVisitorValues>(emptyVisitor);
  const [lookup, setLookup] = useState<Lookup>('idle');
  const [types, setTypes] = useState<VisitType[]>([]);
  const [residentsCount, setResidentsCount] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reinicia al abrir y carga tipos de visita + token (lo necesita el buscador de unidades)
  useEffect(() => {
    if (!open) return;
    setStep(edit ? 2 : 1);
    setError(null);
    setSaving(false);
    setVisitor(null);
    setHistory(null);
    setNewVisitor(emptyVisitor);
    setLookup('idle');
    setResidentsCount(null);
    const base = edit ? visitToForm(edit.visit) : emptyVisitForm(todayInProperty());
    setForm(unscheduled && !edit ? { ...base, startTime: nowHHMM() } : base);
    let cancelled = false;
    (async () => {
      try {
        const t = await getToken();
        if (cancelled) return;
        setToken(t);
        const active = (await getVisitTypesAction({ token: t })).filter((x) => x.isActive);
        if (cancelled) return;
        setTypes(active);
        if (!edit && active.length > 0) setForm((f) => (f.visitTypeId ? f : { ...f, visitTypeId: active[0].id }));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los tipos de visita');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, edit, unscheduled, getToken]);

  // Residentes de la unidad elegida ("N residentes")
  const unitId = form.propertyUnitId;
  useEffect(() => {
    if (!open || !unitId) {
      setResidentsCount(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const t = await getToken();
        const res = await getResidentsAction({ businessId, token: t, propertyUnitId: unitId, page: 1, pageSize: 1 });
        if (!cancelled) setResidentsCount(res.total ?? res.residents.length);
      } catch {
        if (!cancelled) setResidentsCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, unitId, businessId, getToken]);

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
      // Historial: última unidad visitada y sugeridas
      getVisitsAction({ businessId, token: t, visitorId: found.id, page: 1, pageSize: 20 })
        .then((res) => setHistory(visitorHistory(res.visits, res.total)))
        .catch(() => setHistory(null));
    } catch {
      setVisitor(null);
      setLookup('not_found');
    }
  };

  const visitorOpts = { hasVisitor: !!edit || !!visitor, needsNewVisitor: lookup === 'not_found', visitor: newVisitor };

  const goNext = () => {
    const problem = step === 1 ? validateVisitorStep(visitorOpts) : validateVisitStep(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const save = async (andEnter: boolean) => {
    const problem = validateVisitorStep(visitorOpts) ?? validateVisitStep(form) ?? validateVehicleStep(form);
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
      let vehicleId: number | undefined;
      if (form.hasVehicle && normalizePlate(form.plate)) {
        const vehicle = await createVisitorVehicleAction({
          businessId,
          data: { visitorId: v.id, plate: normalizePlate(form.plate), brand: form.brand.trim(), color: form.color.trim() },
          token: t,
        });
        vehicleId = vehicle.id;
      }
      const created = await createVisitAction({ businessId, data: formToCreateDTO(form, v.id, vehicleId), token: t });
      if (andEnter) {
        await registerEntryAction({ businessId, visitId: created.id, data: { gate: vehicleId ? 'Vehicular' : 'Principal', method: 'manual' }, token: t });
        onSaved(`Visita de ${v.fullName} registrada con entrada`);
      } else {
        onSaved(`Visita de ${v.fullName} registrada`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la visita');
    } finally {
      setSaving(false);
    }
  };

  const eyebrow = edit ? 'Editar visita' : `Nueva visita · Paso ${step} de 3`;
  const title = edit ? edit.visitorName : TITLES[step];
  const canEnterNow = !edit && form.date === todayInProperty();

  const footer = (
    <div className="flex w-full flex-wrap items-center gap-2 max-md:[&>*]:flex-1">
      {!edit && step > 1 ? (
        <button type="button" className={vtBtn.ghost} onClick={() => setStep((s) => (s === 3 ? 2 : 1))} disabled={saving}>
          ← {step === 2 ? 'Visitante' : 'Unidad'}
        </button>
      ) : (
        <button type="button" className={vtBtn.ghost} onClick={onClose} disabled={saving}>
          Cancelar
        </button>
      )}
      <div className="md:ml-auto flex flex-wrap gap-2 max-md:w-full max-md:[&>*]:flex-1">
        {edit ? (
          <button type="button" className={vtBtn.primary} onClick={() => save(false)} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        ) : step === 1 ? (
          <button type="button" className={vtBtn.primary} onClick={goNext} disabled={saving}>
            Siguiente: unidad →
          </button>
        ) : (
          <>
            {canEnterNow && (
              <button type="button" className={vtBtn.secondary} onClick={() => save(true)} disabled={saving}>
                Guardar y registrar entrada
              </button>
            )}
            {step === 2 && form.hasVehicle ? (
              <button type="button" className={vtBtn.primary} onClick={goNext} disabled={saving}>
                Siguiente: vehículo →
              </button>
            ) : (
              <button type="button" className={vtBtn.primary} onClick={() => save(false)} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar visita'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      width={620}
      eyebrow={eyebrow}
      title={title}
      subtitle={edit ? <span className={dsMono}>{formatDoc(edit.visitorDni)}</span> : undefined}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {!edit && (
          <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span key={n} className="h-[3px] rounded-full" style={{ background: n <= step ? DS.brand : DS.border }} />
            ))}
          </div>
        )}
        {error && <VtNotice tone="error">{error}</VtNotice>}

        {/* Tarjeta del visitante elegido (pasos 2 y 3) */}
        {!edit && step > 1 && (visitor || lookup === 'not_found') && (
          <VisitorCard
            name={visitor?.fullName ?? newVisitor.fullName}
            meta={[
              formatDoc(visitor?.dni ?? newVisitor.dni),
              visitor ? `visitó ${history?.visits ?? visitor.totalVisits ?? 0} veces` : 'nuevo',
              history?.lastUnit ? `última: ${history.lastUnit}` : '',
            ]}
            blacklisted={visitor?.hasBlacklist}
            onChange={() => setStep(1)}
          />
        )}

        {!edit && step === 1 && (
          <div className="flex flex-col gap-3">
            {lookup === 'found' && visitor ? (
              <VisitorCard
                name={visitor.fullName}
                meta={[formatDoc(visitor.dni), `visitó ${history?.visits ?? visitor.totalVisits ?? 0} veces`, history?.lastUnit ? `última: ${history.lastUnit}` : '']}
                blacklisted={visitor.hasBlacklist}
                onChange={() => {
                  setVisitor(null);
                  setHistory(null);
                  setLookup('idle');
                }}
              />
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
                      placeholder="79456123"
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
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3.5">
            <div className="relative">
              {residentsCount !== null && (
                <span className={`${dsMono} absolute right-0 top-0 text-[11px] text-[#8a8580]`}>
                  {residentsCount} {residentsCount === 1 ? 'residente' : 'residentes'}
                </span>
              )}
              {token ? (
                <UnitAutocomplete value={form.propertyUnitId} onChange={(id) => set('propertyUnitId', id)} businessId={businessId} token={token} required label="Unidad" />
              ) : (
                <div className="h-[62px]" aria-hidden="true" />
              )}
            </div>
            {history && history.suggested.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sugerida por historial">
                <span className="text-[11px] text-[#8a8580] mr-1">Sugerida por historial</span>
                {history.suggested.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    aria-pressed={form.propertyUnitId === u.id}
                    onClick={() => set('propertyUnitId', u.id)}
                    className={`${dsMono} px-3 py-1 max-md:py-2 rounded-full text-xs ${form.propertyUnitId === u.id ? 'bg-[#0F7F8A] text-white' : 'border border-[#e4e2dd] hover:bg-[#f5f5f4]'}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className={vtLabel} id="visit-type-label">
                Tipo de visita <span aria-hidden="true">*</span>
              </div>
              <div role="radiogroup" aria-labelledby="visit-type-label" className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {types.length === 0 && <div className="col-span-full text-[13px] text-[#8a8580]">Cargando tipos…</div>}
                {types.map((t) => {
                  const on = form.visitTypeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set('visitTypeId', t.id)}
                      className={`h-[60px] rounded-2xl px-3 text-left flex flex-col justify-center border transition-colors ${on ? 'border-[#1a1a1a] border-[1.5px] bg-white' : 'border-[#e4e2dd] hover:border-[#c9c6c0]'}`}
                    >
                      <span className="text-[13px] font-semibold truncate">{t.name}</span>
                      <span className="text-[11px] text-[#8a8580] truncate">{visitTypeRule(t)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] gap-3">
              <div>
                <label htmlFor={ids.date} className={vtLabel}>
                  Fecha
                </label>
                <input id={ids.date} type="date" className={`${vtInput} ${dsMono}`} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div>
                <label htmlFor={ids.start} className={vtLabel}>
                  Desde
                </label>
                <input id={ids.start} type="time" className={`${vtInput} ${dsMono} px-2`} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className={vtLabel} id="visit-people-label">
                  Personas
                </div>
                <div className="flex items-center h-10 max-md:h-11 rounded-xl border border-[#d6d3cd]" role="group" aria-labelledby="visit-people-label">
                  <button type="button" aria-label="Menos personas" className="w-10 h-full text-lg" onClick={() => set('numberOfVisitors', Math.max(1, form.numberOfVisitors - 1))}>
                    −
                  </button>
                  <span className={`${dsMono} flex-1 text-center text-sm`} aria-live="polite">
                    {form.numberOfVisitors}
                  </span>
                  <button type="button" aria-label="Más personas" className="w-10 h-full text-lg" onClick={() => set('numberOfVisitors', Math.min(50, form.numberOfVisitors + 1))}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={ids.purpose} className={vtLabel}>
                Motivo
              </label>
              <input id={ids.purpose} className={vtInput} placeholder="Almuerzo familiar, domicilio, mantenimiento…" value={form.purpose} onChange={(e) => set('purpose', e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Check label="Avisar al residente" checked={form.notifyResident} onChange={(v) => set('notifyResident', v)} />
              {!edit && <Check label="Trae vehículo" checked={form.hasVehicle} onChange={(v) => set('hasVehicle', v)} />}
              {!edit && <Check label="Acompañantes" checked={form.hasCompanions} onChange={(v) => set('hasCompanions', v)} />}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor={ids.plate} className={vtLabel}>
                Placa <span aria-hidden="true">*</span>
              </label>
              <input id={ids.plate} className={`${vtInput} ${dsMono} uppercase`} placeholder="KJM842" value={form.plate} onChange={(e) => set('plate', e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.brand} className={vtLabel}>
                Marca
              </label>
              <input id={ids.brand} className={vtInput} placeholder="Mazda" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.color} className={vtLabel}>
                Color
              </label>
              <input id={ids.color} className={vtInput} placeholder="Gris" value={form.color} onChange={(e) => set('color', e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </VtDialog>
  );
}

function VisitorCard({ name, meta, blacklisted, onChange }: { name: string; meta: string[]; blacklisted?: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f4] px-3.5 py-3">
      <div className={`${dsMono} w-9 h-9 rounded-full bg-[#E3F5F5] text-[#0C6B76] flex items-center justify-center text-xs font-semibold shrink-0`} aria-hidden="true">
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{name}</div>
        <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>{meta.filter(Boolean).join(' · ')}</div>
      </div>
      {blacklisted && <VtBadge label="Lista negra" bg={DS.missingBg} fg={DS.no} />}
      <button type="button" className="text-xs font-semibold text-[#c8603f] hover:underline" onClick={onChange}>
        cambiar
      </button>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] min-h-11 md:min-h-0">
      <input type="checkbox" className="h-4 w-4 accent-[#1a1a1a]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
