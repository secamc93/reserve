/**
 * U2 · Nueva / editar unidad (Patrón B: modal de 560 px): torre/bloque · piso · número, tipo
 * en chips, área · habitaciones · baños, recuadro del coeficiente de copropiedad con la suma
 * de la propiedad resultante, descripción y, al editar, el interruptor "Activa" en el pie.
 */

'use client';

import { useId, useState } from 'react';
import { DS, VtDialog, VtNotice, VtSwitch, dsMono, vtBtn, vtInput, vtLabel, vtTextarea } from '@shared/ui/ds';
import { createPropertyUnitAction, updatePropertyUnitAction } from '../infrastructure/actions';
import {
  PropertyUnit,
  UNIT_TYPE_OPTIONS,
  formatCoefficientPct,
  formatUnitLabel,
  getCoefficientStatus,
  projectCoefficientSum,
} from '../domain';
import { getUnitsBusinessToken } from './business-token';
import {
  emptyUnitForm,
  formToCreateDTO,
  formToUpdateDTO,
  parseOptionalNumber,
  unitToForm,
  validateUnitForm,
  type UnitFormValues,
} from './unit-form';

const OTHER_BLOCK = '__otro__';

interface UnitFormDialogProps {
  businessId: number;
  /** Sin unidad: crear. Con unidad: editar. */
  unit?: PropertyUnit | null;
  /** Bloques/torres existentes (para el selector). */
  blocks?: string[];
  /** Suma actual de coeficientes de la propiedad (para la suma resultante). */
  coefficientSum?: number;
  /** Bloque sugerido al crear (p. ej. la pestaña activa). */
  defaultBlock?: string;
  onClose: () => void;
  onSuccess: () => void;
  /** Eliminar la unidad (solo al editar). */
  onDelete?: (unit: PropertyUnit) => void;
}

export function UnitFormDialog({ businessId, unit, blocks = [], coefficientSum, defaultBlock, onClose, onSuccess, onDelete }: UnitFormDialogProps) {
  const editing = Boolean(unit);
  const [values, setValues] = useState<UnitFormValues>(() => (unit ? unitToForm(unit) : { ...emptyUnitForm, block: defaultBlock ?? '' }));
  const knownBlocks = Array.from(new Set(blocks.map((b) => b.trim()).filter(Boolean)));
  const [customBlock, setCustomBlock] = useState(() => knownBlocks.length === 0 || (values.block.trim() !== '' && !knownBlocks.includes(values.block.trim())));
  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const ids = {
    block: useId(), floor: useId(), number: useId(), coefficient: useId(), area: useId(),
    bedrooms: useId(), bathrooms: useId(), description: useId(), typeLabel: useId(),
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
      if (unit) await updatePropertyUnitAction({ businessId, unitId: unit.id, data: formToUpdateDTO(values), token });
      else await createPropertyUnitAction({ businessId, data: formToCreateDTO(values), token });
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message || (editing ? 'No se pudo actualizar la unidad' : 'No se pudo crear la unidad'));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof UnitFormValues) => (errors[key] ? <p className="text-xs mt-1 text-[#c8382d]">{errors[key]}</p> : null);

  const label = formatUnitLabel(unit?.number ?? values.number, unit?.block ?? values.block);
  const eyebrowBlock = (unit?.block ?? values.block).trim();
  const projected =
    coefficientSum !== undefined ? projectCoefficientSum(coefficientSum, unit?.coefficient, parseOptionalNumber(values.coefficient)) : null;
  const status = projected !== null ? getCoefficientStatus(projected) : null;
  const statusColor = status?.ok ? DS.yes : DS.accent;

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={saving}
      eyebrow={editing ? `Unidad${eyebrowBlock ? ` · ${eyebrowBlock}` : ''}` : 'Nueva unidad'}
      title={editing ? `Editar ${label}` : 'Nueva unidad'}
      footer={
        <>
          {editing && (
            <label className="mr-auto flex items-center gap-2 text-[13px] font-medium max-md:order-last max-md:basis-full">
              <VtSwitch checked={values.isActive} onChange={(v) => set('isActive', v)} label="Activa" />
              Activa
            </label>
          )}
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form={formId} className={vtBtn.primary} disabled={saving}>
            {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear unidad'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && <VtNotice>{error}</VtNotice>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor={ids.block} className={vtLabel}>Torre / bloque</label>
            {customBlock ? (
              <input id={ids.block} className={vtInput} value={values.block} onChange={(e) => set('block', e.target.value)} placeholder="Casa" maxLength={10} aria-invalid={Boolean(errors.block)} />
            ) : (
              <select
                id={ids.block}
                className={vtInput}
                value={values.block.trim() === '' ? '' : values.block}
                onChange={(e) => {
                  if (e.target.value === OTHER_BLOCK) {
                    setCustomBlock(true);
                    set('block', '');
                  } else set('block', e.target.value);
                }}
              >
                <option value="">Sin bloque</option>
                {knownBlocks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value={OTHER_BLOCK}>Otro…</option>
              </select>
            )}
            {fieldError('block')}
          </div>
          <div>
            <label htmlFor={ids.floor} className={vtLabel}>Piso</label>
            <input id={ids.floor} className={`${vtInput} ${dsMono}`} inputMode="numeric" value={values.floor} onChange={(e) => set('floor', e.target.value)} aria-invalid={Boolean(errors.floor)} />
            {fieldError('floor')}
          </div>
          <div>
            <label htmlFor={ids.number} className={vtLabel}>Número *</label>
            <input id={ids.number} className={`${vtInput} ${dsMono}`} value={values.number} onChange={(e) => set('number', e.target.value)} placeholder="126" aria-invalid={Boolean(errors.number)} autoFocus />
            {fieldError('number')}
          </div>
        </div>

        <div>
          <span id={ids.typeLabel} className={vtLabel}>Tipo</span>
          <div role="radiogroup" aria-labelledby={ids.typeLabel} className="flex flex-wrap gap-1.5">
            {UNIT_TYPE_OPTIONS.map((t) => {
              const on = values.unitType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set('unitType', t.value)}
                  className={`h-8 max-md:h-11 px-3 rounded-md text-xs font-medium border transition-colors ${
                    on ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#4b4a46] border-[#d6d3cd] hover:bg-[#f5f5f4]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor={ids.area} className={vtLabel}>Área (m²)</label>
            <input id={ids.area} className={`${vtInput} ${dsMono}`} inputMode="decimal" value={values.area} onChange={(e) => set('area', e.target.value)} aria-invalid={Boolean(errors.area)} />
            {fieldError('area')}
          </div>
          <div>
            <label htmlFor={ids.bedrooms} className={vtLabel}>Habitaciones</label>
            <input id={ids.bedrooms} className={`${vtInput} ${dsMono}`} inputMode="numeric" value={values.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} aria-invalid={Boolean(errors.bedrooms)} />
            {fieldError('bedrooms')}
          </div>
          <div>
            <label htmlFor={ids.bathrooms} className={vtLabel}>Baños</label>
            <input id={ids.bathrooms} className={`${vtInput} ${dsMono}`} inputMode="numeric" value={values.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} aria-invalid={Boolean(errors.bathrooms)} />
            {fieldError('bathrooms')}
          </div>
        </div>

        <div className="rounded-lg bg-[#f5f5f4] border border-[#e4e2dd] px-4 py-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={ids.coefficient} className="text-[13px] font-semibold">Coeficiente de copropiedad</label>
            <div className="flex items-center gap-1.5">
              <input
                id={ids.coefficient}
                className={`${vtInput} ${dsMono} w-28 text-right`}
                inputMode="decimal"
                value={values.coefficient}
                onChange={(e) => set('coefficient', e.target.value)}
                placeholder="0,842"
                aria-invalid={Boolean(errors.coefficient)}
              />
              <span className={`${dsMono} text-sm text-[#4b4a46]`}>%</span>
            </div>
          </div>
          {fieldError('coefficient')}
          {projected !== null && status && (
            <>
              <div className="h-1.5 rounded-full bg-[#e4e2dd] overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (projected / status.scale) * 100)}%`, background: statusColor }} />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[#4b4a46]">Suma de la propiedad con este valor</span>
                <span className={`${dsMono} font-semibold`} style={{ color: statusColor }} data-testid="coef-sum">
                  {formatCoefficientPct(projected)}
                </span>
              </div>
            </>
          )}
        </div>

        <div>
          <label htmlFor={ids.description} className={vtLabel}>
            Descripción <span className="font-normal text-[#8a8580]">(opcional)</span>
          </label>
          <textarea id={ids.description} className={vtTextarea} rows={2} value={values.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        {editing && unit && onDelete && (
          <button type="button" className="self-start text-xs font-medium text-[#c8382d] hover:underline" onClick={() => onDelete(unit)}>
            Eliminar unidad
          </button>
        )}
      </form>
    </VtDialog>
  );
}
