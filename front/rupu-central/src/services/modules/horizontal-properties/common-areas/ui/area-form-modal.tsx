/**
 * Z2 · Nueva / editar zona: diálogo de 560 px con datos, capacidad, tarifas y reglas.
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { DsEyebrow, VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel, vtTextarea } from '@/shared/ui/ds';
import type { CommonAreaType } from '../domain';
import { createCommonAreaAction, getCommonAreaByIdAction, getCommonAreaTypesAction, updateCommonAreaAction } from '../infrastructure/actions';
import { applyAreaType, areaFormFrom, areaFormToDTO, emptyAreaForm, validateAreaForm, type AreaFormErrors, type AreaFormState } from './design';

export interface AreaFormModalProps {
  open: boolean;
  businessId: number;
  /** Zona a editar; null = nueva. */
  areaId: number | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={vtLabel}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-[#c8382d]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#8a8580]">{hint}</p>
      ) : null}
    </div>
  );
}

function RuleRow({ label, description, checked, onChange, disabled, children }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; children?: ReactNode }) {
  return (
    <div className="py-2.5 border-b border-[#efedea] last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">{label}</div>
          <div className="text-xs text-[#8a8580]">{description}</div>
        </div>
        <VtSwitch checked={checked} onChange={onChange} label={label} disabled={disabled} />
      </div>
      {checked && children && <div className="mt-2.5">{children}</div>}
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
        const [typesRes, areaRes] = await Promise.all([
          getCommonAreaTypesAction(token),
          areaId !== null ? getCommonAreaByIdAction({ token, businessId, id: areaId }) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        const activeTypes = typesRes.success ? typesRes.data.filter((t) => t.isActive) : [];
        setTypes(activeTypes);
        if (!typesRes.success) setError(typesRes.error);
        if (areaRes) {
          if (areaRes.success) setForm(areaFormFrom(areaRes.data));
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
    setForm((f) => ({ ...f, [key]: value }));
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
      onSaved(editing ? `Zona "${result.data.name}" actualizada` : `Zona "${result.data.name}" creada. Configura su horario para habilitar reservas.`);
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
      subtitle={editing ? form.name : 'Datos, capacidad y reglas de reserva'}
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
        <form id="area-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
          {error && <VtNotice>{error}</VtNotice>}
          {noTypes && <VtNotice tone="info">No hay tipos de zona configurados en la plataforma. Pide al administrador que los cree.</VtNotice>}

          <Field id="area-type" label="Tipo de zona" error={errors.commonAreaTypeId}>
            <select
              id="area-type"
              className={vtInput}
              value={form.commonAreaTypeId || ''}
              onChange={(e) => {
                const type = types.find((t) => t.id === Number(e.target.value));
                if (type) {
                  setForm((f) => (editing ? { ...f, commonAreaTypeId: type.id } : applyAreaType(f, type)));
                  setErrors((er) => ({ ...er, commonAreaTypeId: undefined }));
                }
              }}
            >
              <option value="" disabled>
                Elige un tipo
              </option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field id="area-name" label="Nombre" error={errors.name}>
            <input id="area-name" className={vtInput} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Salón comunal" maxLength={150} />
          </Field>

          <Field id="area-location" label="Ubicación">
            <input id="area-location" className={vtInput} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej: Junto a la portería" maxLength={255} />
          </Field>

          <Field id="area-description" label="Descripción">
            <textarea id="area-description" rows={2} className={vtTextarea} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={1000} />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field id="area-capacity" label="Capacidad (personas)" error={errors.maxCapacity}>
              <input id="area-capacity" type="number" min={1} inputMode="numeric" className={vtInput} value={form.maxCapacity} onChange={(e) => set('maxCapacity', e.target.value)} />
            </Field>
            <Field id="area-sqm" label="Área (m²)" error={errors.areaSqm}>
              <input id="area-sqm" inputMode="decimal" className={vtInput} value={form.areaSqm} onChange={(e) => set('areaSqm', e.target.value)} placeholder="Opcional" />
            </Field>
          </div>

          <Field id="area-rate" label="Tarifa por hora (COP)" error={errors.hourlyRate} hint="Vacío = sin costo">
            <input id="area-rate" inputMode="numeric" className={vtInput} value={form.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} placeholder="Ej: 30.000" />
          </Field>

          <div>
            <DsEyebrow className="mb-1">Reglas</DsEyebrow>
            <RuleRow label="Requiere aprobación" description="La administración aprueba cada reserva" checked={form.requiresApproval} onChange={(v) => set('requiresApproval', v)} />
            <RuleRow label="Cobra depósito" description="Depósito reembolsable por reserva" checked={form.requiresDeposit} onChange={(v) => set('requiresDeposit', v)}>
              <Field id="area-deposit" label="Valor del depósito (COP)" error={errors.depositAmount}>
                <input id="area-deposit" inputMode="numeric" className={vtInput} value={form.depositAmount} onChange={(e) => set('depositAmount', e.target.value)} placeholder="Ej: 200.000" />
              </Field>
            </RuleRow>
            <RuleRow label="Permite reservas recurrentes" description="Semanales o mensuales" checked={form.allowsRecurring} onChange={(v) => set('allowsRecurring', v)} />
            <RuleRow label="Tiene equipamiento" description="Sonido, mesas, asador…" checked={form.hasEquipment} onChange={(v) => set('hasEquipment', v)}>
              <Field id="area-equipment" label="Equipamiento">
                <input id="area-equipment" className={vtInput} value={form.equipmentDescription} onChange={(e) => set('equipmentDescription', e.target.value)} maxLength={500} />
              </Field>
            </RuleRow>
            {editing && <RuleRow label="Zona activa" description="Las zonas inactivas no reciben reservas" checked={form.isActive} onChange={(v) => set('isActive', v)} />}
          </div>
        </form>
      )}
    </VtDialog>
  );
}
