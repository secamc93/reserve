'use client';

/**
 * P2 · Recibir paquete (Patrón B: modal de 560 px): unidad, residente (opcional),
 * transportadora, guía, descripción, notas y aviso al residente.
 */

import { useEffect, useId, useState } from 'react';
import { VtDialog, VtNotice, VtSwitch, vtBtn, vtInput, vtLabel, vtTextarea, dsMono } from '@/shared/ui/ds';
import { receivePackageAction } from '../infrastructure/actions';
import type { CreatePackageDTO } from '../domain';
import { getResidentsAction } from '@/services/modules/horizontal-properties/residents/infrastructure/actions';
import type { Resident } from '@/services/modules/horizontal-properties/residents/domain';
import { useBusinessToken } from './use-business-token';
import { UnitPicker, type PickedUnit } from './unit-picker';

interface ReceivePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se llama tras guardar con el texto de confirmación. */
  onSuccess: (message: string) => void;
  businessId: number;
}

/** Transportadoras frecuentes para elegir con un toque. */
export const COMMON_CARRIERS = ['Servientrega', 'Interrapidísimo', 'Coordinadora', 'Envía', 'Mercado Libre', 'Amazon', 'DHL'];

export interface ReceiveFormValues {
  unit: PickedUnit | null;
  residentId?: number;
  carrier: string;
  trackingNumber: string;
  description: string;
  notes: string;
  notifyResident: boolean;
}

export const emptyReceiveForm = (): ReceiveFormValues => ({
  unit: null,
  residentId: undefined,
  carrier: '',
  trackingNumber: '',
  description: '',
  notes: '',
  notifyResident: true,
});

/** Primer error del formulario o null. */
export function validateReceiveForm(f: ReceiveFormValues): string | null {
  if (!f.unit) return 'Elige la unidad a la que llega el paquete';
  if (!f.carrier.trim()) return 'Escribe la transportadora';
  if (!f.trackingNumber.trim()) return 'Escribe el número de guía';
  return null;
}

export function receiveFormToDTO(f: ReceiveFormValues): CreatePackageDTO {
  return {
    propertyUnitId: f.unit!.id,
    residentId: f.residentId,
    carrier: f.carrier.trim(),
    trackingNumber: f.trackingNumber.trim(),
    description: f.description.trim() || undefined,
    notes: f.notes.trim() || undefined,
    notifyResident: f.notifyResident,
  };
}

export function ReceivePackageModal({ isOpen, onClose, onSuccess, businessId }: ReceivePackageModalProps) {
  const getToken = useBusinessToken(businessId);
  const ids = { resident: useId(), carrier: useId(), tracking: useId(), description: useId(), notes: useId() };
  const [form, setForm] = useState<ReceiveFormValues>(emptyReceiveForm);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyReceiveForm());
      setResidents([]);
      setError(null);
      setSaving(false);
    }
  }, [isOpen]);

  // Residentes de la unidad elegida (opcional)
  const unitId = form.unit?.id;
  useEffect(() => {
    if (!unitId) {
      setResidents([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await getResidentsAction({ businessId, token, propertyUnitId: unitId, page: 1, pageSize: 100 });
        if (!cancelled) setResidents(res.residents || []);
      } catch {
        if (!cancelled) setResidents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unitId, businessId, getToken]);

  const set = <K extends keyof ReceiveFormValues>(k: K, v: ReceiveFormValues[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const problem = validateReceiveForm(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      await receivePackageAction({ businessId, data: receiveFormToDTO(form), token });
      onSuccess(`Paquete para ${form.unit!.label} recibido`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el paquete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={isOpen}
      onClose={onClose}
      busy={saving}
      eyebrow="Paquetería"
      title="Recibir paquete"
      subtitle="Queda por entregar hasta que el residente lo recoja"
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className={vtBtn.primary} onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : 'Recibir paquete'}
          </button>
        </>
      }
    >
      <form
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {error && <VtNotice tone="error">{error}</VtNotice>}
        <UnitPicker
          businessId={businessId}
          getToken={getToken}
          value={form.unit}
          onChange={(u) => setForm((f) => ({ ...f, unit: u, residentId: undefined }))}
        />
        {residents.length > 0 && (
          <div>
            <label htmlFor={ids.resident} className={vtLabel}>
              Para
            </label>
            <select id={ids.resident} className={vtInput} value={form.residentId ?? ''} onChange={(e) => set('residentId', e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Cualquier residente de la unidad</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor={ids.carrier} className={vtLabel}>
            Transportadora <span aria-hidden="true">*</span>
          </label>
          <input id={ids.carrier} className={vtInput} list={`${ids.carrier}-list`} value={form.carrier} onChange={(e) => set('carrier', e.target.value)} placeholder="Servientrega, Interrapidísimo…" />
          <datalist id={`${ids.carrier}-list`}>
            {COMMON_CARRIERS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Transportadoras frecuentes">
            {COMMON_CARRIERS.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={form.carrier === c}
                onClick={() => set('carrier', c)}
                className={`px-2.5 py-1 max-md:py-2 rounded-[5px] text-xs font-medium ${form.carrier === c ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f4] text-[#4b4a46] hover:bg-[#e9e7e2]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={ids.tracking} className={vtLabel}>
            Número de guía <span aria-hidden="true">*</span>
          </label>
          <input id={ids.tracking} className={`${vtInput} ${dsMono}`} autoComplete="off" value={form.trackingNumber} onChange={(e) => set('trackingNumber', e.target.value)} />
        </div>
        <div>
          <label htmlFor={ids.description} className={vtLabel}>
            Descripción
          </label>
          <input id={ids.description} className={vtInput} placeholder="Caja mediana, sobre, nevera de icopor…" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label htmlFor={ids.notes} className={vtLabel}>
            Notas
          </label>
          <textarea id={ids.notes} rows={2} className={vtTextarea} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f5f5f4] px-3.5 py-3">
          <span className="text-[13px]">Avisar al residente</span>
          <VtSwitch label="Avisar al residente" checked={form.notifyResident} onChange={(v) => set('notifyResident', v)} />
        </div>
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </VtDialog>
  );
}
