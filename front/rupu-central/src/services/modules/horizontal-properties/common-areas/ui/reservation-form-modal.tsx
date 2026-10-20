/**
 * Nueva reserva (diálogo de 560 px): zona, unidad ("Casa 126"), fecha, horas y personas.
 * El back valida horario, bloqueos, solapes y capacidad; aquí se adelanta lo básico.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { DsEyebrow, VtDialog, VtNotice, dsMono, vtBtn, vtInput, vtLabel, vtTextarea } from '@/shared/ui/ds';
import type { CommonAreaListDTO, UnitLookup } from '../domain';
import { createReservationAction, searchUnitsAction } from '../infrastructure/actions';
import { formatMoney, reservationToDTO, scheduleSummary, toMinutes, unitLabel, validateReservation, type ReservationFormErrors, type ReservationFormState } from './design';

export interface ReservationFormModalProps {
  open: boolean;
  businessId: number;
  zones: CommonAreaListDTO[];
  defaultZoneId?: number;
  defaultDate: string;
  getToken: () => Promise<string>;
  onClose: () => void;
  onCreated: (message: string) => void;
}

export function ReservationFormModal({ open, businessId, zones, defaultZoneId, defaultDate, getToken, onClose, onCreated }: ReservationFormModalProps) {
  const [form, setForm] = useState<ReservationFormState>({
    commonAreaId: 0,
    propertyUnitId: 0,
    date: defaultDate,
    startTime: '10:00',
    endTime: '12:00',
    numberOfGuests: '1',
    purpose: '',
    specialRequests: '',
  });
  const [unit, setUnit] = useState<UnitLookup | null>(null);
  const [unitQuery, setUnitQuery] = useState('');
  const [units, setUnits] = useState<UnitLookup[]>([]);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      commonAreaId: defaultZoneId ?? zones[0]?.id ?? 0,
      propertyUnitId: 0,
      date: defaultDate,
      startTime: '10:00',
      endTime: '12:00',
      numberOfGuests: '1',
      purpose: '',
      specialRequests: '',
    });
    setUnit(null);
    setUnitQuery('');
    setUnits([]);
    setErrors({});
    setError(null);
  }, [open, defaultZoneId, defaultDate, zones]);

  // Buscador de unidades con espera corta.
  useEffect(() => {
    if (!open || unit) return;
    const term = unitQuery.trim();
    if (!term) {
      setUnits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const token = await getToken();
        const result = await searchUnitsAction({ token, businessId, search: term, limit: 8 });
        if (!cancelled) setUnits(result.success ? result.data : []);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [unitQuery, unit, open, businessId, getToken]);

  const zone = useMemo(() => zones.find((z) => z.id === form.commonAreaId), [zones, form.commonAreaId]);
  const hours = Math.max(0, (toMinutes(form.endTime) - toMinutes(form.startTime)) / 60);

  const set = <K extends keyof ReservationFormState>(key: K, value: ReservationFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateReservation(form, zone?.maxCapacity);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await createReservationAction({ token, businessId, data: reservationToDTO(form) });
      if (!result.success) {
        setError(result.error);
        return;
      }
      const pending = result.data.statusCode === 'pending';
      onCreated(`Reserva de ${unit ? unitLabel(unit.number, unit.block) : 'la unidad'} creada${pending ? ' · pendiente de aprobación' : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={saving}
      eyebrow="Reservas"
      title="Nueva reserva"
      subtitle="A nombre de una unidad de la propiedad"
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form="reservation-form" className={vtBtn.primary} disabled={saving || zones.length === 0}>
            {saving ? 'Reservando…' : 'Crear reserva'}
          </button>
        </>
      }
    >
      <form id="reservation-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && <VtNotice>{error}</VtNotice>}
        {zones.length === 0 && <VtNotice tone="info">No hay zonas activas para reservar.</VtNotice>}

        <div>
          <label htmlFor="reservation-zone" className={vtLabel}>
            Zona
          </label>
          <select id="reservation-zone" className={vtInput} value={form.commonAreaId || ''} onChange={(e) => set('commonAreaId', Number(e.target.value))}>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          {zone && (
            <p className={`${dsMono} mt-1 text-[11px] text-[#8a8580]`}>
              {scheduleSummary(zone.schedules)} · máx. {zone.maxCapacity} personas{zone.requiresApproval ? ' · requiere aprobación' : ''}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reservation-unit" className={vtLabel}>
            Unidad
          </label>
          {unit ? (
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-[#1a1a1a]">
              <span className="text-sm font-semibold flex-1">{unitLabel(unit.number, unit.block)}</span>
              <button
                type="button"
                className="text-xs font-medium text-[#c8603f]"
                onClick={() => {
                  setUnit(null);
                  set('propertyUnitId', 0);
                }}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <input id="reservation-unit" className={vtInput} value={unitQuery} onChange={(e) => setUnitQuery(e.target.value)} placeholder="Busca por número: 126" autoComplete="off" />
              {(units.length > 0 || searching) && (
                <ul role="listbox" aria-label="Unidades encontradas" className="list-none m-0 mt-1 p-1 border border-[#e4e2dd] rounded-xl max-h-44 overflow-y-auto">
                  {searching && units.length === 0 && <li className="px-2 py-1.5 text-xs text-[#8a8580]">Buscando…</li>}
                  {units.map((u) => (
                    <li key={u.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1.5 rounded-xl text-[13px] hover:bg-[#f5f5f4]"
                        onClick={() => {
                          setUnit(u);
                          set('propertyUnitId', u.id);
                        }}
                      >
                        {unitLabel(u.number, u.block)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {errors.propertyUnitId && <p className="mt-1 text-xs text-[#c8382d]">{errors.propertyUnitId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="reservation-date" className={vtLabel}>
              Fecha
            </label>
            <input id="reservation-date" type="date" className={vtInput} value={form.date} onChange={(e) => set('date', e.target.value)} />
            {errors.date && <p className="mt-1 text-xs text-[#c8382d]">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="reservation-start" className={vtLabel}>
              Desde
            </label>
            <input id="reservation-start" type="time" className={vtInput} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </div>
          <div>
            <label htmlFor="reservation-end" className={vtLabel}>
              Hasta
            </label>
            <input id="reservation-end" type="time" className={vtInput} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </div>
        </div>
        {errors.endTime && <p className="-mt-2 text-xs text-[#c8382d]">{errors.endTime}</p>}

        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
          <div>
            <label htmlFor="reservation-guests" className={vtLabel}>
              Personas
            </label>
            <input id="reservation-guests" type="number" min={1} inputMode="numeric" className={vtInput} value={form.numberOfGuests} onChange={(e) => set('numberOfGuests', e.target.value)} />
          </div>
          <div>
            <label htmlFor="reservation-purpose" className={vtLabel}>
              Motivo
            </label>
            <input id="reservation-purpose" className={vtInput} value={form.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="Ej: Cumpleaños" maxLength={500} />
          </div>
        </div>
        {errors.numberOfGuests && <p className="-mt-2 text-xs text-[#c8382d]">{errors.numberOfGuests}</p>}

        <div>
          <label htmlFor="reservation-requests" className={vtLabel}>
            Solicitudes especiales
          </label>
          <textarea id="reservation-requests" rows={2} className={vtTextarea} value={form.specialRequests} onChange={(e) => set('specialRequests', e.target.value)} maxLength={1000} />
        </div>

        {zone && (zone.hourlyRate || zone.requiresDeposit) && hours > 0 ? (
          <div className="rounded-2xl bg-[#f5f5f4] px-3.5 py-2.5 flex justify-between items-center">
            <DsEyebrow>Valor estimado</DsEyebrow>
            <span className={`${dsMono} text-sm font-semibold`}>
              {zone.hourlyRate ? formatMoney(zone.hourlyRate * hours) : 'Sin costo'}
              {zone.requiresDeposit && zone.depositAmount ? ` + depósito ${formatMoney(zone.depositAmount)}` : ''}
            </span>
          </div>
        ) : null}
      </form>
    </VtDialog>
  );
}
