/**
 * Z2 · Nueva / editar zona (diálogo de 560 px): Nombre + Tipo; Ubicación · Capacidad · Área;
 * recuadro "Reglas de reserva" (aprobación, recurrentes, tarifa, depósito, horario y días
 * L–D); equipamiento opcional. El horario básico se guarda junto con la zona.
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { DsEyebrow, VtDialog, VtNotice, VtSwitch, dsMono, vtBtn, vtInput, vtLabel } from '@/shared/ui/ds';
import type { CommonAreaType } from '../domain';
import { createCommonAreaAction, getCommonAreaByIdAction, getCommonAreaTypesAction, getSchedulesAction, setSchedulesAction, updateCommonAreaAction } from '../infrastructure/actions';
import {
  ALL_DAYS,
  DAY_LONG,
  applyAreaType,
  areaFormFrom,
  areaFormToDTO,
  basicScheduleToRows,
  emptyAreaForm,
  toggleDay,
  validateAreaForm,
  type AreaFormErrors,
  type AreaFormState,
} from './design';

export interface AreaFormModalProps {
  open: boolean;
  businessId: number;
  /** Zona a editar; null = nueva. */
  areaId: number | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const DAY_LETTER: Record<number, string> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' };

function Field({ id, label, error, children, className = '' }: { id: string; label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={vtLabel}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#c8382d]">{error}</p>}
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px]">{label}</span>
      <VtSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function AreaFormModal({ open, businessId, areaId, getToken, onClose, onSaved }: AreaFormModalProps) {
  const editing = areaId !== null;
  const [types, setTypes] = useState<CommonAreaType[]>([]);
  const [form, setForm] = useState<AreaFormState>(emptyAreaForm());
  const [errors, setErrors] = useState<AreaFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setErrors({});
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const [typesRes, areaRes, schedRes] = await Promise.all([
          getCommonAreaTypesAction(token),
          areaId !== null ? getCommonAreaByIdAction({ token, businessId, id: areaId }) : Promise.resolve(null),
          areaId !== null ? getSchedulesAction({ token, businessId, id: areaId }) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        const activeTypes = typesRes.success ? typesRes.data.filter((t) => t.isActive) : [];
        setTypes(activeTypes);
        if (!typesRes.success) setError(typesRes.error);
        if (areaRes) {
          if (areaRes.success) setForm(areaFormFrom(areaRes.data, schedRes && schedRes.success ? schedRes.data : []));
          else setError(areaRes.error);
        } else {
          setForm(activeTypes[0] ? applyAreaType(emptyAreaForm(), activeTypes[0]) : emptyAreaForm());
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, areaId, businessId, getToken]);

  const set = <K extends keyof AreaFormState>(key: K, value: AreaFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'scheduleStart' || key === 'scheduleEnd' ? { scheduleDirty: true } : {}) }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateAreaForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const data = areaFormToDTO(form);
      const result =
        areaId !== null
          ? await updateCommonAreaAction({ token, businessId, id: areaId, data })
          : await createCommonAreaAction({ token, businessId, data });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (form.scheduleDirty) {
        const sched = await setSchedulesAction({ token, businessId, id: result.data.id, schedules: basicScheduleToRows(form) });
        if (!sched.success) {
          setError(`La zona se guardó, pero el horario no: ${sched.error}`);
          return;
        }
      }
      onSaved(editing ? `Zona "${result.data.name}" actualizada` : `Zona "${result.data.name}" creada`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la zona');
    } finally {
      setSaving(false);
    }
  };

  const noTypes = !loading && types.length === 0;

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Zonas comunes"
      title={editing ? 'Editar zona' : 'Nueva zona'}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="area-form" className={vtBtn.primary} disabled={saving || loading || noTypes}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear zona'}
          </button>
        </>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-[#8a8580]">Cargando…</div>
      ) : (
        <form id="area-form" onSubmit={submit} noValidate className="flex flex-col gap-3.5">
          {error && <VtNotice>{error}</VtNotice>}
          {noTypes && <VtNotice tone="info">No hay tipos de zona configurados en la plataforma.</VtNotice>}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-3">
            <Field id="area-name" label="Nombre" error={errors.name}>
              <input id="area-name" className={vtInput} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Salón comunal" maxLength={150} />
            </Field>
            <Field id="area-type" label="Tipo" error={errors.commonAreaTypeId}>
              <select
                id="area-type"
                className={vtInput}
                value={form.commonAreaTypeId || ''}
                onChange={(e) => {
                  const type = types.find((t) => t.id === Number(e.target.value));
                  if (!type) return;
                  setForm((f) => (editing ? { ...f, commonAreaTypeId: type.id } : applyAreaType(f, type)));
                  setErrors((er) => ({ ...er, commonAreaTypeId: undefined }));
                }}
              >
                <option value="" disabled>
                  Elegir
                </option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_110px] gap-3">
            <Field id="area-location" label="Ubicación">
              <input id="area-location" className={vtInput} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej: Torre B, piso 1" maxLength={255} />
            </Field>
            <Field id="area-capacity" label="Capacidad" error={errors.maxCapacity}>
              <div className="relative">
                <input id="area-capacity" type="number" min={1} inputMode="numeric" className={`${vtInput} pr-16`} value={form.maxCapacity} onChange={(e) => set('maxCapacity', e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a8580] pointer-events-none">personas</span>
              </div>
            </Field>
            <Field id="area-sqm" label="Área (m²)" error={errors.areaSqm}>
              <input id="area-sqm" inputMode="decimal" className={vtInput} value={form.areaSqm} onChange={(e) => set('areaSqm', e.target.value)} />
            </Field>
          </div>

          <section aria-label="Reglas de reserva" className="rounded-2xl bg-[#f5f5f4] p-3.5 flex flex-col gap-3">
            <DsEyebrow>Reglas de reserva</DsEyebrow>
            <SwitchRow label="Requiere aprobación del administrador" checked={form.requiresApproval} onChange={(v) => set('requiresApproval', v)} />
            <SwitchRow label="Permite reservas recurrentes" checked={form.allowsRecurring} onChange={(v) => set('allowsRecurring', v)} />

            <div className="grid grid-cols-2 gap-3">
              <Field id="area-rate" label="Tarifa/hora (COP)" error={errors.hourlyRate}>
                <input id="area-rate" inputMode="numeric" className={`${vtInput} ${dsMono}`} value={form.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} placeholder="0" />
              </Field>
              <Field id="area-deposit" label="Depósito (COP)" error={errors.depositAmount}>
                <input id="area-deposit" inputMode="numeric" className={`${vtInput} ${dsMono}`} value={form.depositAmount} onChange={(e) => set('depositAmount', e.target.value)} placeholder="0" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-start">
              <div>
                <span className={vtLabel} id="area-hours-label">
                  Horario
                </span>
                <div className="flex items-center gap-1.5" role="group" aria-labelledby="area-hours-label">
                  <input type="time" aria-label="Hora de apertura" className={`${vtInput} !w-[104px] ${dsMono}`} value={form.scheduleStart} onChange={(e) => set('scheduleStart', e.target.value)} />
                  <span className="text-[#8a8580]">–</span>
                  <input type="time" aria-label="Hora de cierre" className={`${vtInput} !w-[104px] ${dsMono}`} value={form.scheduleEnd} onChange={(e) => set('scheduleEnd', e.target.value)} />
                </div>
              </div>
              <div>
                <span className={vtLabel} id="area-days-label">
                  Días
                </span>
                <div className="flex gap-1" role="group" aria-labelledby="area-days-label">
                  {ALL_DAYS.map((day) => {
                    const on = form.openDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={on}
                        aria-label={DAY_LONG[day]}
                        onClick={() => setForm((f) => toggleDay(f, day))}
                        className={`${dsMono} w-10 h-10 max-md:w-11 max-md:h-11 rounded-full text-xs font-semibold border transition-colors ${on ? 'bg-[#0F7F8A] text-white border-[#0F7F8A]' : 'bg-white text-[#8a8580] border-[#e4e2dd] hover:bg-[#f5f5f4]'}`}
                      >
                        {DAY_LETTER[day]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {errors.scheduleEnd && <p className="-mt-1.5 text-xs text-[#c8382d]">{errors.scheduleEnd}</p>}
            {form.customSchedule && !form.scheduleDirty && (
              <p className="m-0 text-xs text-[#8a8580]">Esta zona tiene horas distintas por día; si cambias el horario aquí se aplica igual a todos los días abiertos.</p>
            )}
          </section>

          <Field id="area-equipment" label="Equipamiento (opcional)">
            <input id="area-equipment" className={vtInput} value={form.equipmentDescription} onChange={(e) => set('equipmentDescription', e.target.value)} placeholder="Sonido, mesas, asador…" maxLength={500} />
          </Field>

          {editing && <SwitchRow label="Zona activa (recibe reservas)" checked={form.isActive} onChange={(v) => set('isActive', v)} />}
        </form>
      )}
    </VtDialog>
  );
}
