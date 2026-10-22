/**
 * R2 · Nuevo / editar residente (Patrón B: modal de 560 px): unidad (con sus residentes
 * actuales) y tipo segmentado; nombre + documento; correo + teléfono; contacto de emergencia;
 * contrato de arrendamiento solo para arrendatarios; en el pie, "Residente principal de la
 * unidad".
 */

'use client';

import { useEffect, useId, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DsEyebrow, VtDialog, VtNotice, VtSwitch, dsMono, vtBtn, vtInput, vtLabel } from '@shared/ui/ds';
import { createResidentAction, getResidentByIdAction, updateResidentAction } from '../infrastructure/actions';
import type { Resident } from '../domain';
import { isTenantType } from '../domain';
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

export interface ResidentFormType {
  id: number;
  name: string;
  code?: string;
}

interface ResidentFormDialogProps {
  businessId: number;
  /** Sin residente: crear. Con residente (del listado): editar (se carga el detalle completo). */
  resident?: Resident | null;
  types: ResidentFormType[];
  onClose: () => void;
  onSuccess: () => void;
}

/** Traduce los errores conocidos del back a un mensaje claro. */
export function friendlyResidentError(message: string, fallback: string): string {
  const m = message.toLowerCase();
  if (m.includes('email')) return 'El correo ya está registrado o no es válido';
  if (m.includes('dni') || m.includes('documento')) return 'El documento ya está registrado';
  if (m.includes('token')) return 'La sesión expiró. Inicia sesión de nuevo';
  if (m.includes('not found') || m.includes('no encontrado')) return 'El residente no fue encontrado';
  return message || fallback;
}

export function ResidentFormDialog({ businessId, resident, types, onClose, onSuccess }: ResidentFormDialogProps) {
  const editing = Boolean(resident);
  const defaultType = types[0]?.id ?? 1;
  const [values, setValues] = useState<ResidentFormValues>(() => emptyResidentForm(defaultType));
  const [unitResidents, setUnitResidents] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<ResidentFormErrors>({});
  const [loadingDetail, setLoadingDetail] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const ids = {
    typeLabel: useId(), name: useId(), dni: useId(), email: useId(), phone: useId(),
    emergency: useId(), leaseStart: useId(), leaseEnd: useId(), rent: useId(),
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
        setValues(residentToForm(full, formatUnitLabel(full.propertyUnitNumber || resident.propertyUnitNumber, resident.propertyUnitBlock)));
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

  const selectedType = types.find((t) => t.id === values.residentTypeId);
  const tenant = isTenantType(selectedType);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateResidentForm(values, editing ? 'edit' : 'create');
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError(null);
    // El contrato solo aplica a arrendatarios: si no lo es, no se envía.
    const payload = tenant ? values : { ...values, leaseStartDate: '', leaseEndDate: '', monthlyRent: '' };
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('token');
      if (resident) await updateResidentAction({ businessId, residentId: resident.id, data: formToUpdateResidentDTO(payload), token });
      else await createResidentAction({ businessId, data: formToCreateResidentDTO(payload), token });
      onSuccess();
    } catch (err) {
      const fallback = editing ? 'No se pudo actualizar el residente' : 'No se pudo crear el residente';
      setError(friendlyResidentError(err instanceof Error ? err.message : '', fallback));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof ResidentFormValues) => (errors[key] ? <p className="text-xs mt-1 text-[#c8382d]">{errors[key]}</p> : null);

  return (
    <VtDialog
      open
      onClose={onClose}
      busy={saving}
      eyebrow={editing ? `Residente · ${values.unitLabel || '…'}` : 'Nuevo residente'}
      title={editing ? `Editar ${resident?.name ?? 'residente'}` : 'Nuevo residente'}
      footer={
        <>
          <label className="mr-auto flex items-center gap-2 text-[13px] max-md:basis-full max-md:order-first">
            <input type="checkbox" className="w-4 h-4 accent-[#1a1a1a]" checked={values.isMainResident} onChange={(e) => set('isMainResident', e.target.checked)} disabled={loadingDetail} />
            Residente principal de la unidad
          </label>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" form={formId} className={vtBtn.primary} disabled={saving || loadingDetail}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear residente'}
          </button>
        </>
      }
    >
      {loadingDetail ? (
        <div className="py-8 text-center text-sm text-[#8a8580]">Cargando datos del residente…</div>
      ) : (
        <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
          {error && <VtNotice>{error}</VtNotice>}

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
            <UnitPicker
              businessId={businessId}
              value={{ id: values.propertyUnitId, label: values.unitLabel, residentsCount: unitResidents }}
              onChange={(o) => {
                setValues((v) => ({ ...v, propertyUnitId: o.id, unitLabel: o.label }));
                setUnitResidents(o.residentsCount);
                if (errors.unitLabel) setErrors((er) => ({ ...er, unitLabel: undefined }));
              }}
              error={errors.unitLabel}
            />
            <div>
              <span id={ids.typeLabel} className={vtLabel}>Tipo *</span>
              <div role="radiogroup" aria-labelledby={ids.typeLabel} className="inline-flex flex-wrap rounded-full border border-[#d6d3cd] p-0.5 bg-white">
                {types.map((t) => {
                  const on = t.id === values.residentTypeId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => set('residentTypeId', t.id)}
                      className={`h-[34px] max-md:h-10 px-3.5 rounded-full text-xs font-medium transition-colors ${on ? 'bg-[#0F7F8A] text-white' : 'text-[#4b4a46] hover:bg-[#f5f5f4]'}`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
              {fieldError('residentTypeId')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_160px] gap-3">
            <div>
              <label htmlFor={ids.name} className={vtLabel}>Nombre completo *</label>
              <input id={ids.name} className={vtInput} value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
              {fieldError('name')}
            </div>
            <div>
              <label htmlFor={ids.dni} className={vtLabel}>Documento{editing ? '' : ' *'}</label>
              <input id={ids.dni} className={`${vtInput} ${dsMono}`} value={values.dni} onChange={(e) => set('dni', e.target.value)} aria-invalid={Boolean(errors.dni)} />
              {fieldError('dni')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.email} className={vtLabel}>Correo{editing ? '' : ' *'}</label>
              <input id={ids.email} type="email" className={vtInput} value={values.email} onChange={(e) => set('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
              {fieldError('email')}
            </div>
            <div>
              <label htmlFor={ids.phone} className={vtLabel}>Teléfono</label>
              <input id={ids.phone} type="tel" className={`${vtInput} ${dsMono}`} value={values.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor={ids.emergency} className={vtLabel}>
              Contacto de emergencia <span className="font-normal text-[#8a8580]">(opcional)</span>
            </label>
            <input id={ids.emergency} className={vtInput} value={values.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} />
          </div>

          {tenant && (
            <div className="rounded-2xl bg-[#f5f5f4] border border-[#e4e2dd] px-4 py-3.5 flex flex-col gap-3" aria-label="Contrato de arrendamiento" role="group">
              <DsEyebrow>Contrato de arrendamiento</DsEyebrow>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={ids.leaseStart} className={vtLabel}>Inicio</label>
                  <input id={ids.leaseStart} type="date" className={`${vtInput} ${dsMono}`} value={values.leaseStartDate} onChange={(e) => set('leaseStartDate', e.target.value)} />
                </div>
                <div>
                  <label htmlFor={ids.leaseEnd} className={vtLabel}>Fin</label>
                  <input id={ids.leaseEnd} type="date" className={`${vtInput} ${dsMono}`} value={values.leaseEndDate} onChange={(e) => set('leaseEndDate', e.target.value)} aria-invalid={Boolean(errors.leaseEndDate)} />
                  {fieldError('leaseEndDate')}
                </div>
                <div>
                  <label htmlFor={ids.rent} className={vtLabel}>Canon (COP)</label>
                  <input id={ids.rent} inputMode="numeric" className={`${vtInput} ${dsMono}`} value={values.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} aria-invalid={Boolean(errors.monthlyRent)} />
                  {fieldError('monthlyRent')}
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e4e2dd] px-3.5 py-2.5">
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
