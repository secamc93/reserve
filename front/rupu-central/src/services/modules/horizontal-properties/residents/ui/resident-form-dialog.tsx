/**
 * R2 · Formulario de residente (Patrón B: modal de 560 px). Crear y editar comparten campos:
 * unidad y tipo, datos de contacto, residente principal y ocupación (ingreso, arriendo).
 */

'use client';

import { useEffect, useId, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DsEyebrow, VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel } from '@shared/ui/ds';
import { createResidentAction, getResidentByIdAction, updateResidentAction } from '../infrastructure/actions';
import type { Resident } from '../domain';
import { formatUnitLabel } from '../../units/domain';
import {
  emptyResidentForm,
  formToCreateResidentDTO,
  formToUpdateResidentDTO,
  residentToForm,
  validateResidentForm,
  type ResidentFormErrors,
  type ResidentFormValues,
} from './resident-form';
import { UnitPicker } from './unit-picker';

interface ResidentFormDialogProps {
  businessId: number;
  /** Sin residente: crear. Con residente (del listado): editar (se carga el detalle completo). */
  resident?: Resident | null;
  types: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

/** Traduce los errores conocidos del back a un mensaje claro. */
export function friendlyResidentError(message: string, fallback: string): string {
  const m = message.toLowerCase();
  if (m.includes('email')) return 'El email ya está registrado o no es válido';
  if (m.includes('dni') || m.includes('documento')) return 'El documento ya está registrado';
  if (m.includes('token')) return 'La sesión expiró. Inicia sesión de nuevo';
  if (m.includes('not found') || m.includes('no encontrado')) return 'El residente no fue encontrado';
  return message || fallback;
}

export function ResidentFormDialog({ businessId, resident, types, onClose, onSuccess }: ResidentFormDialogProps) {
  const editing = Boolean(resident);
  const defaultType = types[0]?.id ?? 1;
  const [values, setValues] = useState<ResidentFormValues>(() => emptyResidentForm(defaultType));
  const [errors, setErrors] = useState<ResidentFormErrors>({});
  const [loadingDetail, setLoadingDetail] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const ids = {
    type: useId(),
    name: useId(),
    email: useId(),
    dni: useId(),
    phone: useId(),
    emergency: useId(),
    moveIn: useId(),
    moveOut: useId(),
    leaseStart: useId(),
    leaseEnd: useId(),
    rent: useId(),
  };

  useEffect(() => {
    if (!resident) return;
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      try {
        const token = TokenStorage.getBusinessToken();
        if (!token) throw new Error('token');
        const full = await getResidentByIdAction({ businessId, residentId: resident.id, token });
        if (cancelled) return;
        const label = formatUnitLabel(full.propertyUnitNumber || resident.propertyUnitNumber, resident.propertyUnitBlock);
        setValues(residentToForm(full, label));
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos del residente');
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, resident]);

  const set = <K extends keyof ResidentFormValues>(key: K, value: ResidentFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateResidentForm(values, editing ? 'edit' : 'create');
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('token');
      if (resident) {
        await updateResidentAction({ businessId, residentId: resident.id, data: formToUpdateResidentDTO(values), token });
      } else {
        await createResidentAction({ businessId, data: formToCreateResidentDTO(values), token });
      }
      onSuccess();
    } catch (err) {
      const fallback = editing ? 'No se pudo actualizar el residente' : 'No se pudo crear el residente';
      setError(friendlyResidentError(err instanceof Error ? err.message : '', fallback));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof ResidentFormValues) =>
    errors[key] ? <p className="text-xs mt-1 text-[#c8382d]">{errors[key]}</p> : null;

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={saving}
      eyebrow={editing ? 'Editar residente' : 'Nuevo residente'}
      title={editing ? resident?.name || 'Residente' : 'Agregar residente'}
      subtitle={editing ? values.unitLabel : 'Asigna la persona a una unidad de la copropiedad.'}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form={formId} className={vtBtn.primary} disabled={saving || loadingDetail}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar residente'}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="py-8 text-center text-sm text-[#8a8580]">Cargando datos del residente…</div>
      ) : (
        <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
          {error && <VtNotice>{error}</VtNotice>}

          <DsEyebrow>Unidad</DsEyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UnitPicker
              businessId={businessId}
              value={{ id: values.propertyUnitId, label: values.unitLabel }}
              onChange={(o) => {
                setValues((v) => ({ ...v, propertyUnitId: o.id, unitLabel: o.label }));
                if (errors.unitLabel) setErrors((er) => ({ ...er, unitLabel: undefined }));
              }}
              error={errors.unitLabel}
            />
            <div>
              <label htmlFor={ids.type} className={vtLabel}>Tipo *</label>
              <select id={ids.type} className={vtInput} value={values.residentTypeId} onChange={(e) => set('residentTypeId', Number(e.target.value))}>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {fieldError('residentTypeId')}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e4e2dd] px-3.5 py-2.5">
            <div>
              <div className="text-[13px] font-semibold">Residente principal</div>
              <div className="text-xs text-[#8a8580]">Contacto principal de la unidad.</div>
            </div>
            <VtSwitch checked={values.isMainResident} onChange={(v) => set('isMainResident', v)} label="Residente principal" />
          </div>

          <DsEyebrow>Datos personales</DsEyebrow>
          <div>
            <label htmlFor={ids.name} className={vtLabel}>Nombre completo *</label>
            <input id={ids.name} className={vtInput} value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
            {fieldError('name')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.dni} className={vtLabel}>Documento{editing ? '' : ' *'}</label>
              <input id={ids.dni} className={vtInput} value={values.dni} onChange={(e) => set('dni', e.target.value)} aria-invalid={Boolean(errors.dni)} />
              {fieldError('dni')}
            </div>
            <div>
              <label htmlFor={ids.email} className={vtLabel}>Email{editing ? '' : ' *'}</label>
              <input id={ids.email} type="email" className={vtInput} value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
              {fieldError('email')}
            </div>
            <div>
              <label htmlFor={ids.phone} className={vtLabel}>Teléfono</label>
              <input id={ids.phone} type="tel" className={vtInput} value={values.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.emergency} className={vtLabel}>Contacto de emergencia</label>
              <input id={ids.emergency} className={vtInput} value={values.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} />
            </div>
          </div>

          <DsEyebrow>Ocupación</DsEyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.moveIn} className={vtLabel}>Fecha de ingreso</label>
              <input id={ids.moveIn} type="date" className={vtInput} value={values.moveInDate} onChange={(e) => set('moveInDate', e.target.value)} />
            </div>
            {editing ? (
              <div>
                <label htmlFor={ids.moveOut} className={vtLabel}>Fecha de salida</label>
                <input id={ids.moveOut} type="date" className={vtInput} value={values.moveOutDate} onChange={(e) => set('moveOutDate', e.target.value)} />
              </div>
            ) : (
              <div>
                <label htmlFor={ids.rent} className={vtLabel}>Canon mensual</label>
                <input id={ids.rent} inputMode="numeric" className={vtInput} value={values.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} aria-invalid={Boolean(errors.monthlyRent)} />
                {fieldError('monthlyRent')}
              </div>
            )}
            <div>
              <label htmlFor={ids.leaseStart} className={vtLabel}>Inicio del arriendo</label>
              <input id={ids.leaseStart} type="date" className={vtInput} value={values.leaseStartDate} onChange={(e) => set('leaseStartDate', e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.leaseEnd} className={vtLabel}>Fin del arriendo</label>
              <input id={ids.leaseEnd} type="date" className={vtInput} value={values.leaseEndDate} onChange={(e) => set('leaseEndDate', e.target.value)} aria-invalid={Boolean(errors.leaseEndDate)} />
              {fieldError('leaseEndDate')}
            </div>
            {editing && (
              <div>
                <label htmlFor={ids.rent} className={vtLabel}>Canon mensual</label>
                <input id={ids.rent} inputMode="numeric" className={vtInput} value={values.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} aria-invalid={Boolean(errors.monthlyRent)} />
                {fieldError('monthlyRent')}
              </div>
            )}
          </div>

          {editing && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e4e2dd] px-3.5 py-2.5">
              <div>
                <div className="text-[13px] font-semibold">Residente activo</div>
                <div className="text-xs text-[#8a8580]">Desactívalo cuando ya no viva en la copropiedad.</div>
              </div>
              <VtSwitch checked={values.isActive} onChange={(v) => set('isActive', v)} label="Residente activo" />
            </div>
          )}
        </form>
      )}
    </VtDialog>
  );
}
