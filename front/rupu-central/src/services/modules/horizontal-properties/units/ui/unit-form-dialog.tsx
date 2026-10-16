/**
 * U2 · Formulario de unidad (Patrón B: modal de 560 px). Crear y editar comparten campos:
 * identificación (número, bloque, tipo), coeficiente de copropiedad y características.
 */

'use client';

import { useId, useState } from 'react';
import { VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel, vtTextarea, DsEyebrow } from '@shared/ui/ds';
import { createPropertyUnitAction, updatePropertyUnitAction } from '../infrastructure/actions';
import { PropertyUnit, UNIT_TYPE_LABELS } from '../domain';
import { getUnitsBusinessToken } from './business-token';
import {
  emptyUnitForm,
  formToCreateDTO,
  formToUpdateDTO,
  unitToForm,
  validateUnitForm,
  type UnitFormValues,
} from './unit-form';

interface UnitFormDialogProps {
  businessId: number;
  /** Sin unidad: crear. Con unidad: editar. */
  unit?: PropertyUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitFormDialog({ businessId, unit, onClose, onSuccess }: UnitFormDialogProps) {
  const editing = Boolean(unit);
  const [values, setValues] = useState<UnitFormValues>(() => (unit ? unitToForm(unit) : emptyUnitForm));
  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ids = {
    number: useId(),
    block: useId(),
    type: useId(),
    coefficient: useId(),
    floor: useId(),
    area: useId(),
    bedrooms: useId(),
    bathrooms: useId(),
    description: useId(),
  };

  const set = <K extends keyof UnitFormValues>(key: K, value: UnitFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateUnitForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      if (unit) {
        await updatePropertyUnitAction({ businessId, unitId: unit.id, data: formToUpdateDTO(values), token });
      } else {
        await createPropertyUnitAction({ businessId, data: formToCreateDTO(values), token });
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message || (editing ? 'No se pudo actualizar la unidad' : 'No se pudo crear la unidad'));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof UnitFormValues) =>
    errors[key] ? <p className="text-xs mt-1 text-[#c8382d]">{errors[key]}</p> : null;

  const formId = useId();

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={saving}
      eyebrow={editing ? 'Editar unidad' : 'Nueva unidad'}
      title={editing ? `Unidad ${values.block ? `${values.block} ` : ''}${values.number}`.trim() : 'Crear unidad'}
      subtitle={editing ? 'Actualiza los datos de la unidad.' : 'Registra una unidad de la copropiedad.'}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear unidad'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && <VtNotice>{error}</VtNotice>}

        <DsEyebrow>Identificación</DsEyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor={ids.number} className={vtLabel}>Número *</label>
            <input id={ids.number} className={vtInput} value={values.number} onChange={(e) => set('number', e.target.value)} placeholder="126" aria-invalid={Boolean(errors.number)} autoFocus />
            {fieldError('number')}
          </div>
          <div>
            <label htmlFor={ids.block} className={vtLabel}>Bloque / torre</label>
            <input id={ids.block} className={vtInput} value={values.block} onChange={(e) => set('block', e.target.value)} placeholder="Casa" maxLength={10} aria-invalid={Boolean(errors.block)} />
            {fieldError('block')}
          </div>
          <div>
            <label htmlFor={ids.type} className={vtLabel}>Tipo *</label>
            <select id={ids.type} className={vtInput} value={values.unitType} onChange={(e) => set('unitType', e.target.value)}>
              {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={ids.coefficient} className={vtLabel}>Coeficiente de copropiedad</label>
            <input id={ids.coefficient} className={vtInput} inputMode="decimal" value={values.coefficient} onChange={(e) => set('coefficient', e.target.value)} placeholder="0,503" aria-invalid={Boolean(errors.coefficient)} />
            {fieldError('coefficient')}
          </div>
          <div>
            <label htmlFor={ids.floor} className={vtLabel}>Piso</label>
            <input id={ids.floor} className={vtInput} inputMode="numeric" value={values.floor} onChange={(e) => set('floor', e.target.value)} aria-invalid={Boolean(errors.floor)} />
            {fieldError('floor')}
          </div>
        </div>

        <DsEyebrow>Características</DsEyebrow>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor={ids.area} className={vtLabel}>Área (m²)</label>
            <input id={ids.area} className={vtInput} inputMode="decimal" value={values.area} onChange={(e) => set('area', e.target.value)} aria-invalid={Boolean(errors.area)} />
            {fieldError('area')}
          </div>
          <div>
            <label htmlFor={ids.bedrooms} className={vtLabel}>Habitaciones</label>
            <input id={ids.bedrooms} className={vtInput} inputMode="numeric" value={values.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} aria-invalid={Boolean(errors.bedrooms)} />
            {fieldError('bedrooms')}
          </div>
          <div>
            <label htmlFor={ids.bathrooms} className={vtLabel}>Baños</label>
            <input id={ids.bathrooms} className={vtInput} inputMode="numeric" value={values.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} aria-invalid={Boolean(errors.bathrooms)} />
            {fieldError('bathrooms')}
          </div>
        </div>

        <div>
          <label htmlFor={ids.description} className={vtLabel}>Descripción</label>
          <textarea id={ids.description} className={vtTextarea} rows={2} value={values.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        {editing && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e4e2dd] px-3.5 py-2.5">
            <div>
              <div className="text-[13px] font-semibold">Unidad activa</div>
              <div className="text-xs text-[#8a8580]">Desactívala si ya no hace parte de la copropiedad.</div>
            </div>
            <VtSwitch checked={values.isActive} onChange={(v) => set('isActive', v)} label="Unidad activa" />
          </div>
        )}
      </form>
    </VtDialog>
  );
}
