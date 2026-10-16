'use client';

/**
 * P2 · Recibir paquete (modal de 560 px, un paso): unidad y "Para" (residente) en dos columnas,
 * transportadora en chips (Otra → campo), guía opcional, foto (pendiente de subida) y
 * descripción, aviso al residente y "Recibir · HH:MM".
 */

import { useEffect, useId, useState } from 'react';
import { VtDialog, VtIcon, VtNotice, vtBtn, vtInput, vtLabel, vtTextarea, dsMono } from '@/shared/ui/ds';
import { receivePackageAction } from '../infrastructure/actions';
import type { CreatePackageDTO } from '../domain';
import { getResidentsAction } from '@/services/modules/horizontal-properties/residents/infrastructure/actions';
import type { Resident } from '@/services/modules/horizontal-properties/residents/domain';
import { useBusinessToken } from './use-business-token';
import { UnitPicker, type PickedUnit } from './unit-picker';
import { formatClock } from './package-state';

interface ReceivePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se llama tras guardar con el texto de confirmación. */
  onSuccess: (message: string) => void;
  businessId: number;
}

/** Transportadoras del diseño; "Otra" abre un campo. */
export const CARRIER_CHIPS = ['Servientrega', 'Coordinadora', 'Rappi'] as const;
export const OTHER_CARRIER = 'Otra';

export interface ReceiveFormValues {
  unit: PickedUnit | null;
  residentId?: number;
  /** Chip elegido (una de CARRIER_CHIPS u "Otra"). */
  carrierChip: string;
  /** Texto cuando el chip es "Otra". */
  carrierOther: string;
  trackingNumber: string;
  description: string;
  notifyResident: boolean;
}

export const emptyReceiveForm = (): ReceiveFormValues => ({
  unit: null,
  residentId: undefined,
  carrierChip: CARRIER_CHIPS[0],
  carrierOther: '',
  trackingNumber: '',
  description: '',
  notifyResident: true,
});

export function carrierOf(f: Pick<ReceiveFormValues, 'carrierChip' | 'carrierOther'>): string {
  return f.carrierChip === OTHER_CARRIER ? f.carrierOther.trim() : f.carrierChip;
}

/** Primer error del formulario o null. La guía es opcional. */
export function validateReceiveForm(f: ReceiveFormValues): string | null {
  if (!f.unit) return 'Elige la unidad a la que llega el paquete';
  if (!carrierOf(f)) return 'Escribe la transportadora';
  return null;
}

export function receiveFormToDTO(f: ReceiveFormValues): CreatePackageDTO {
  return {
    propertyUnitId: f.unit!.id,
    residentId: f.residentId,
    carrier: carrierOf(f),
    trackingNumber: f.trackingNumber.trim(),
    description: f.description.trim() || undefined,
    notifyResident: f.notifyResident,
  };
}

export function ReceivePackageModal({ isOpen, onClose, onSuccess, businessId }: ReceivePackageModalProps) {
  const getToken = useBusinessToken(businessId);
  const ids = { resident: useId(), other: useId(), tracking: useId(), description: useId() };
  const [form, setForm] = useState<ReceiveFormValues>(emptyReceiveForm);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isOpen) return;
    setForm(emptyReceiveForm());
    setResidents([]);
    setError(null);
    setSaving(false);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, [isOpen]);

  // Residentes de la unidad elegida
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

  const clock = formatClock(now.toISOString());

  return (
    <VtDialog
      open={isOpen}
      onClose={onClose}
      busy={saving}
      eyebrow="Paquetería"
      title="Recibir paquete"
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className={vtBtn.primary} onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : `Recibir · ${clock}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UnitPicker businessId={businessId} getToken={getToken} value={form.unit} onChange={(u) => setForm((f) => ({ ...f, unit: u, residentId: undefined }))} />
          <div>
            <label htmlFor={ids.resident} className={vtLabel}>
              Para
            </label>
            <select
              id={ids.resident}
              className={vtInput}
              disabled={!form.unit}
              value={form.residentId ?? ''}
              onChange={(e) => set('residentId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{form.unit ? 'Cualquier residente' : 'Elige la unidad'}</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className={vtLabel} id="carrier-label">
            Transportadora <span aria-hidden="true">*</span>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="carrier-label">
            {[...CARRIER_CHIPS, OTHER_CARRIER].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={form.carrierChip === c}
                onClick={() => set('carrierChip', c)}
                className={`px-3 py-1.5 max-md:py-2.5 rounded-[6px] text-[13px] font-medium ${form.carrierChip === c ? 'bg-[#1a1a1a] text-white' : 'border border-[#d6d3cd] text-[#4b4a46] hover:bg-[#f5f5f4]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          {form.carrierChip === OTHER_CARRIER && (
            <div className="mt-2">
              <label htmlFor={ids.other} className="sr-only">
                Otra transportadora
              </label>
              <input id={ids.other} className={vtInput} placeholder="Interrapidísimo, Envía, Mercado Libre…" value={form.carrierOther} onChange={(e) => set('carrierOther', e.target.value)} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor={ids.tracking} className={vtLabel}>
            Guía <span className="font-normal text-[#8a8580]">(opcional)</span>
          </label>
          <div className="relative">
            <input id={ids.tracking} className={`${vtInput} ${dsMono} pr-11`} autoComplete="off" value={form.trackingNumber} onChange={(e) => set('trackingNumber', e.target.value)} />
            <button
              type="button"
              disabled
              title="Sin lector de códigos conectado: escribe la guía"
              aria-label="Escanear guía (sin lector conectado)"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-[#8a8580] disabled:opacity-60"
            >
              <VtIcon name="qr" size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled
            title="La foto del paquete estará disponible cuando se habilite la subida de archivos"
            className="w-[120px] h-[96px] shrink-0 rounded-lg border-[1.5px] border-dashed border-[#c9c6c0] bg-[#faf9f7] text-[11px] text-[#8a8580] flex flex-col items-center justify-center gap-1 cursor-not-allowed"
          >
            <span className="text-lg leading-none" aria-hidden="true">
              +
            </span>
            Foto
          </button>
          <div className="flex-1 min-w-0">
            <label htmlFor={ids.description} className="sr-only">
              Descripción
            </label>
            <textarea
              id={ids.description}
              className={`${vtTextarea} h-[96px]`}
              placeholder="Descripción: caja mediana, sobre, nevera de icopor…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-[13px]">
          <input type="checkbox" className="h-4 w-4 accent-[#1a1a1a]" checked={form.notifyResident} onChange={(e) => set('notifyResident', e.target.checked)} />
          Avisar al residente por WhatsApp y correo
        </label>
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </VtDialog>
  );
}
