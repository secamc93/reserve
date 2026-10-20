/**
 * Formularios del rediseño de parqueaderos (patrón B: modal de 560 px):
 *  - ZoneFormDialog: nueva zona.
 *  - BulkSlotsDialog (K2): varios cupos de una vez (prefijo + desde..hasta).
 *  - AssignSlotDialog (K2b): asignar un cupo a una unidad, o editar la asignación.
 *  - VisitorReservationDialog: reserva de un cupo para un visitante.
 *  - ReleaseDialog: confirmar liberar un cupo.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { DsEyebrow, VtDialog, VtNotice, dsMono, vtBtn, vtDialogFooter, vtInput, vtLabel } from '@shared/ui/ds';
import { getPropertyUnitsAction } from '../../units/infrastructure/actions';
import { getResidentsAction } from '../../residents/infrastructure/actions';
import {
  assignParkingSafeAction,
  createParkingReservationSafeAction,
  createParkingSlotsBulkAction,
  createParkingZoneSafeAction,
  releaseParkingAssignmentAction,
  updateParkingAssignmentAction,
} from '../infrastructure/actions';
import type { ParkingAssignmentListDTO, ParkingSlotListDTO, ParkingType, ParkingZoneListDTO } from '../domain';
import { parkingToken } from './use-parking-data';
import { bulkPreview, toISODay, unitLabel } from './parking-view-model';

const Footer = ({ onCancel, submitLabel, busy, disabled }: { onCancel: () => void; submitLabel: string; busy: boolean; disabled?: boolean }) => (
  <div className={`${vtDialogFooter} border-t border-[#e4e2dd] mt-2`}>
    <button type="button" className={vtBtn.secondary} onClick={onCancel} disabled={busy}>Cancelar</button>
    <button type="submit" className={vtBtn.primary} disabled={busy || disabled}>{busy ? 'Guardando…' : submitLabel}</button>
  </div>
);

const Check = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#0F7F8A]" />
    {label}
  </label>
);

const num = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(',', '.')));

// ===================== Zona =====================

export function ZoneFormDialog({ open, businessId, onClose, onSaved }: { open: boolean; businessId: number; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setName(''); setCode(''); setLocation(''); setError(null); }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { setError('Nombre y código son obligatorios'); return; }
    setBusy(true);
    const res = await createParkingZoneSafeAction({ businessId, token: parkingToken(), data: { name: name.trim(), code: code.trim().toUpperCase(), location: location.trim() } });
    setBusy(false);
    if (!res.success) { setError(res.error || 'No se pudo crear la zona'); return; }
    onSaved();
  };

  return (
    <VtDialog open={open} onClose={onClose} eyebrow="Parqueaderos" title="Nueva zona" busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="zone-name" className={vtLabel}>Nombre</label>
          <input id="zone-name" className={vtInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sótano 1, Visitantes…" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="zone-code" className={vtLabel}>Código</label>
            <input id="zone-code" className={`${vtInput} ${dsMono}`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="S1" />
          </div>
          <div>
            <label htmlFor="zone-loc" className={vtLabel}>Ubicación <span className="font-normal text-[#8a8580]">· opcional</span></label>
            <input id="zone-loc" className={vtInput} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Acceso rampa norte" />
          </div>
        </div>
        {error && <VtNotice>{error}</VtNotice>}
        <Footer onCancel={onClose} submitLabel="Crear zona" busy={busy} />
      </form>
    </VtDialog>
  );
}

// ===================== K2 · Cupos en lote =====================

export function BulkSlotsDialog({
  open,
  businessId,
  zones,
  types,
  onClose,
  onSaved,
}: {
  open: boolean;
  businessId: number;
  zones: ParkingZoneListDTO[];
  types: ParkingType[];
  onClose: () => void;
  onSaved: (created: number) => void;
}) {
  const [zoneId, setZoneId] = useState<number | ''>('');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('10');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [covered, setCovered] = useState(false);
  const [charger, setCharger] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setZoneId(zones[0]?.id ?? '');
    setTypeId(types[0]?.id ?? '');
    setError(null);
  }, [open, zones, types]);

  // El prefijo sugerido es el código de la zona ("P2-").
  useEffect(() => {
    const z = zones.find((x) => x.id === zoneId);
    if (z && open) setPrefix(z.code ? `${z.code}-` : '');
  }, [zoneId, zones, open]);

  const pad = from.trim().length;
  const preview = bulkPreview(prefix, Number(from), Number(to), pad);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId || !typeId) { setError('Elige la zona y el tipo'); return; }
    if (!preview) { setError('Revisa la numeración: "hasta" debe ser mayor o igual que "desde"'); return; }
    if (preview.count > 200) { setError('Se pueden crear máximo 200 cupos a la vez'); return; }
    setBusy(true);
    const res = await createParkingSlotsBulkAction({
      businessId,
      token: parkingToken(),
      data: { parkingZoneId: zoneId, parkingTypeId: typeId, prefix, from: Number(from), to: Number(to), pad, isCovered: covered, hasCharger: charger, width: num(width), length: num(length), height: num(height) },
    });
    setBusy(false);
    if (!res.success) { setError(res.error || 'No se pudieron crear los cupos'); return; }
    onSaved(res.data?.created ?? preview.count);
  };

  return (
    <VtDialog open={open} onClose={onClose} eyebrow="Parqueaderos" title="Nuevos cupos" busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="bulk-zone" className={vtLabel}>Zona</label>
            <select id="bulk-zone" className={vtInput} value={zoneId} onChange={(e) => setZoneId(Number(e.target.value))}>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div>
            <span className={vtLabel} id="bulk-type-label">Tipo</span>
            <div role="radiogroup" aria-labelledby="bulk-type-label" className="h-10 border border-[#d6d3cd] rounded-full grid p-[3px] gap-[3px] text-xs" style={{ gridTemplateColumns: `repeat(${Math.max(1, types.length)}, 1fr)` }}>
              {types.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={typeId === t.id} onClick={() => setTypeId(t.id)} className={`rounded-full transition-colors ${typeId === t.id ? 'bg-[#0F7F8A] text-white font-semibold' : 'text-[#4b4a46] hover:bg-[#f5f5f4]'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <span className={vtLabel}>Numeración</span>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            <input aria-label="Prefijo" className={`${vtInput} ${dsMono}`} value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="prefijo" />
            <span className="text-[#8a8580] text-sm">desde</span>
            <input aria-label="Desde" inputMode="numeric" className={`${vtInput} ${dsMono}`} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ''))} />
            <span className="text-[#8a8580] text-sm">hasta</span>
            <input aria-label="Hasta" inputMode="numeric" className={`${vtInput} ${dsMono}`} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ''))} />
          </div>
          <p className="text-[11px] text-[#8a8580] mt-1.5">
            {preview ? <>Se crearán <strong className="text-[#1a1a1a]">{preview.count} cupos</strong>: {preview.first} … {preview.last}</> : 'Numeración inválida'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['Ancho', width, setWidth], ['Largo', length, setLength], ['Alto', height, setHeight]].map(([label, value, set]) => (
            <div key={label as string}>
              <label className={vtLabel} htmlFor={`bulk-${label}`}>{label as string}</label>
              <div className="relative">
                <input id={`bulk-${label}`} inputMode="decimal" className={`${vtInput} ${dsMono} pr-7`} value={value as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} placeholder="—" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a8580]">m</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-[18px]">
          <Check checked={covered} onChange={setCovered} label="Cubierto" />
          <Check checked={charger} onChange={setCharger} label="Cargador eléctrico" />
        </div>
        {error && <VtNotice>{error}</VtNotice>}
        <Footer onCancel={onClose} submitLabel={preview ? `Crear ${preview.count} cupos` : 'Crear cupos'} busy={busy} disabled={!preview} />
      </form>
    </VtDialog>
  );
}

// ===================== K2b · Asignar / editar =====================

interface UnitOption { id: number; number: string; block?: string }
interface ResidentOption { id: number; name: string; type: string }

export function AssignSlotDialog({
  open,
  businessId,
  slots,
  initialSlot,
  initialUnit,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  businessId: number;
  /** Cupos para elegir (los libres). */
  slots: ParkingSlotListDTO[];
  initialSlot?: ParkingSlotListDTO | null;
  initialUnit?: UnitOption | null;
  /** Si viene, edita esa asignación (cupo y unidad fijos). */
  editing?: ParkingAssignmentListDTO | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slotId, setSlotId] = useState<number | ''>('');
  const [unitQuery, setUnitQuery] = useState('');
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [unit, setUnit] = useState<UnitOption | null>(null);
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [residentId, setResidentId] = useState<number | ''>('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [start, setStart] = useState(toISODay(new Date()));
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setSlotId(editing.parkingSlotId);
      setUnit(editing.propertyUnitId ? { id: editing.propertyUnitId, number: editing.propertyUnitNumber, block: editing.propertyUnitBlock } : null);
      setResidentId(editing.residentId ?? '');
      setPlate(editing.vehiclePlate);
      setBrand(editing.vehicleBrand ?? '');
      setModel(editing.vehicleModel ?? '');
      setColor(editing.vehicleColor ?? '');
      setStart(editing.startDate.slice(0, 10));
      setEnd(editing.endDate ? editing.endDate.slice(0, 10) : '');
    } else {
      setSlotId(initialSlot?.id ?? '');
      setUnit(initialUnit ?? null);
      setUnitQuery('');
      setResidentId('');
      setPlate(''); setBrand(''); setModel(''); setColor('');
      setStart(toISODay(new Date()));
      setEnd('');
    }
  }, [open, editing, initialSlot, initialUnit]);

  // Buscar unidades por número.
  useEffect(() => {
    if (!open || editing || unit || unitQuery.trim().length === 0) { setUnitOptions([]); return; }
    let alive = true;
    const t = setTimeout(() => {
      getPropertyUnitsAction({ businessId, token: parkingToken(), page: 1, pageSize: 8, number: unitQuery.trim(), isActive: true })
        .then((r) => alive && setUnitOptions(r.units.map((u) => ({ id: u.id, number: u.number, block: u.block }))))
        .catch(() => alive && setUnitOptions([]));
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [unitQuery, unit, open, editing, businessId]);

  // Residentes de la unidad elegida.
  useEffect(() => {
    if (!open || !unit) { setResidents([]); return; }
    let alive = true;
    getResidentsAction({ businessId, token: parkingToken(), page: 1, pageSize: 50, propertyUnitId: unit.id })
      .then((r) => alive && setResidents(r.residents.map((x) => ({ id: x.id, name: x.name, type: x.residentTypeName }))))
      .catch(() => alive && setResidents([]));
    return () => { alive = false; };
  }, [unit, open, businessId]);

  const slotOptions = useMemo(() => {
    const list = editing ? [] : slots.filter((s) => !s.isAssigned && s.isActive);
    if (initialSlot && !list.some((s) => s.id === initialSlot.id)) list.unshift(initialSlot);
    return list;
  }, [slots, initialSlot, editing]);

  const selectedSlotNumber = editing ? editing.parkingSlotNumber : slotOptions.find((s) => s.id === slotId)?.slotNumber;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plate.trim()) { setError('La placa es obligatoria'); return; }
    if (end && end < start) { setError('La fecha final no puede ser anterior a la inicial'); return; }
    setBusy(true);
    const token = parkingToken();
    const res = editing
      ? await updateParkingAssignmentAction({
          id: editing.id,
          businessId,
          token,
          data: { vehiclePlate: plate.trim().toUpperCase(), vehicleBrand: brand, vehicleModel: model, vehicleColor: color, endDate: end ? `${end}T00:00:00Z` : null, notes: editing.notes },
        })
      : !slotId || !unit
        ? { success: false, error: 'Elige el cupo y la unidad' }
        : await assignParkingSafeAction({
            businessId,
            token,
            data: {
              parkingSlotId: slotId,
              propertyUnitId: unit.id,
              residentId: residentId || undefined,
              vehiclePlate: plate.trim().toUpperCase(),
              vehicleBrand: brand,
              vehicleModel: model,
              vehicleColor: color,
              startDate: `${start}T00:00:00Z`,
              endDate: end ? `${end}T00:00:00Z` : undefined,
            },
          });
    setBusy(false);
    if (!res.success) { setError(res.error || 'No se pudo guardar la asignación'); return; }
    onSaved();
  };

  return (
    <VtDialog open={open} onClose={onClose} eyebrow={editing ? 'Editar asignación' : 'Asignación permanente'} title={editing ? `Cupo ${editing.parkingSlotNumber}` : 'Asignar cupo'} busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="asg-slot" className={vtLabel}>Cupo</label>
            {editing ? (
              <div className={`${vtInput} ${dsMono} flex items-center bg-[#f5f5f4]`}>{editing.parkingSlotNumber}</div>
            ) : (
              <select id="asg-slot" className={`${vtInput} ${dsMono}`} value={slotId} onChange={(e) => setSlotId(Number(e.target.value))}>
                <option value="">Elegir cupo libre</option>
                {slotOptions.map((s) => <option key={s.id} value={s.id}>{s.slotNumber} · {s.parkingZoneName}</option>)}
              </select>
            )}
          </div>
          <div className="relative">
            <label htmlFor="asg-unit" className={vtLabel}>Unidad</label>
            {unit ? (
              <div className={`${vtInput} ${dsMono} flex items-center justify-between ${editing ? 'bg-[#f5f5f4]' : ''}`}>
                {unitLabel(unit.block, unit.number)}
                {!editing && (
                  <button type="button" className="text-xs text-[#8a8580] hover:text-[#1a1a1a]" onClick={() => { setUnit(null); setResidentId(''); }} aria-label="Cambiar unidad">cambiar</button>
                )}
              </div>
            ) : (
              <>
                <input id="asg-unit" className={`${vtInput} ${dsMono}`} value={unitQuery} onChange={(e) => setUnitQuery(e.target.value)} placeholder="Número, ej. 126" autoComplete="off" />
                {unitOptions.length > 0 && (
                  <ul role="listbox" aria-label="Unidades" className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#e4e2dd] rounded-xl shadow-md max-h-56 overflow-auto">
                    {unitOptions.map((u) => (
                      <li key={u.id}>
                        <button type="button" role="option" aria-selected={false} onClick={() => setUnit(u)} className={`${dsMono} w-full text-left px-3 py-2 text-sm hover:bg-[#f5f5f4]`}>
                          {unitLabel(u.block, u.number)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        {!editing && (
          <div>
            <label htmlFor="asg-res" className={vtLabel}>Residente <span className="font-normal text-[#8a8580]">· opcional</span></label>
            <select id="asg-res" className={vtInput} value={residentId} onChange={(e) => setResidentId(e.target.value ? Number(e.target.value) : '')} disabled={!unit}>
              <option value="">{unit ? 'Sin residente' : 'Primero elige la unidad'}</option>
              {residents.map((r) => <option key={r.id} value={r.id}>{r.name}{r.type ? ` · ${r.type.toLowerCase()}` : ''}</option>)}
            </select>
          </div>
        )}
        <div className="border border-[#e4e2dd] rounded-2xl p-3.5 bg-[#faf9f7] flex flex-col gap-2.5">
          <DsEyebrow>Vehículo</DsEyebrow>
          <div className="grid grid-cols-2 md:grid-cols-[130px_1fr_1fr_100px] gap-2.5">
            <div>
              <label htmlFor="asg-plate" className={vtLabel}>Placa</label>
              <input id="asg-plate" className={`${vtInput} ${dsMono} font-semibold tracking-[.04em] uppercase`} value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC-123" />
            </div>
            <div>
              <label htmlFor="asg-brand" className={vtLabel}>Marca</label>
              <input id="asg-brand" className={vtInput} value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label htmlFor="asg-model" className={vtLabel}>Modelo</label>
              <input id="asg-model" className={vtInput} value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div>
              <label htmlFor="asg-color" className={vtLabel}>Color</label>
              <input id="asg-color" className={vtInput} value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="asg-start" className={vtLabel}>Desde</label>
            <input id="asg-start" type="date" className={`${vtInput} ${dsMono}`} value={start} onChange={(e) => setStart(e.target.value)} disabled={!!editing} />
          </div>
          <div>
            <label htmlFor="asg-end" className={vtLabel}>Hasta <span className="font-normal text-[#8a8580]">· vacío = indefinido</span></label>
            <input id="asg-end" type="date" className={`${vtInput} ${dsMono}`} value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        {error && <VtNotice>{error}</VtNotice>}
        <Footer onCancel={onClose} submitLabel={editing ? 'Guardar cambios' : selectedSlotNumber ? `Asignar ${selectedSlotNumber}` : 'Asignar cupo'} busy={busy} />
      </form>
    </VtDialog>
  );
}

// ===================== Reserva de visitante =====================

export function VisitorReservationDialog({
  open,
  businessId,
  slots,
  initialNotes,
  onClose,
  onSaved,
}: {
  open: boolean;
  businessId: number;
  slots: ParkingSlotListDTO[];
  /** Ej. "Desde visita #4810" cuando la reserva nace de una visita. */
  initialNotes?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slotId, setSlotId] = useState<number | ''>('');
  const [date, setDate] = useState(toISODay(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [plate, setPlate] = useState('');
  const [unitQuery, setUnitQuery] = useState('');
  const [unit, setUnit] = useState<UnitOption | null>(null);
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Primero los cupos de zonas de visitantes.
  const options = useMemo(() => {
    const active = slots.filter((s) => s.isActive && !s.isAssigned);
    return [...active].sort((a, b) => Number(/visit/i.test(b.parkingZoneName)) - Number(/visit/i.test(a.parkingZoneName)));
  }, [slots]);

  useEffect(() => {
    if (!open) return;
    setSlotId(options[0]?.id ?? '');
    setDate(toISODay(new Date()));
    setStartTime('09:00');
    setEndTime('11:00');
    setPlate('');
    setUnit(null);
    setUnitQuery('');
    setNotes(initialNotes ?? '');
    setError(null);
  }, [open, options, initialNotes]);

  useEffect(() => {
    if (!open || unit || unitQuery.trim().length === 0) { setUnitOptions([]); return; }
    let alive = true;
    const t = setTimeout(() => {
      getPropertyUnitsAction({ businessId, token: parkingToken(), page: 1, pageSize: 8, number: unitQuery.trim(), isActive: true })
        .then((r) => alive && setUnitOptions(r.units.map((u) => ({ id: u.id, number: u.number, block: u.block }))))
        .catch(() => alive && setUnitOptions([]));
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [unitQuery, unit, open, businessId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!slotId) { setError('Elige el cupo'); return; }
    if (!plate.trim()) { setError('La placa es obligatoria'); return; }
    if (endTime <= startTime) { setError('La hora de salida debe ser posterior a la de entrada'); return; }
    setBusy(true);
    const res = await createParkingReservationSafeAction({
      businessId,
      token: parkingToken(),
      data: {
        parkingSlotId: slotId,
        propertyUnitId: unit?.id,
        reservationDate: `${date}T00:00:00Z`,
        startTime,
        endTime,
        vehiclePlate: plate.trim().toUpperCase(),
        notes: notes.trim() || undefined,
      },
    });
    setBusy(false);
    if (!res.success) { setError(res.error || 'No se pudo crear la reserva'); return; }
    onSaved();
  };

  return (
    <VtDialog open={open} onClose={onClose} eyebrow="Reserva de visitante" title="Nueva reserva de parqueadero" busy={busy}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rsv-slot" className={vtLabel}>Cupo</label>
            <select id="rsv-slot" className={`${vtInput} ${dsMono}`} value={slotId} onChange={(e) => setSlotId(Number(e.target.value))}>
              {options.length === 0 && <option value="">No hay cupos libres</option>}
              {options.map((s) => <option key={s.id} value={s.id}>{s.slotNumber} · {s.parkingZoneName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rsv-plate" className={vtLabel}>Placa</label>
            <input id="rsv-plate" className={`${vtInput} ${dsMono} font-semibold uppercase`} value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC-123" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="rsv-date" className={vtLabel}>Fecha</label>
            <input id="rsv-date" type="date" className={`${vtInput} ${dsMono}`} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="rsv-start" className={vtLabel}>Entrada</label>
            <input id="rsv-start" type="time" className={`${vtInput} ${dsMono}`} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label htmlFor="rsv-end" className={vtLabel}>Salida</label>
            <input id="rsv-end" type="time" className={`${vtInput} ${dsMono}`} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="relative">
          <label htmlFor="rsv-unit" className={vtLabel}>Unidad que recibe <span className="font-normal text-[#8a8580]">· opcional</span></label>
          {unit ? (
            <div className={`${vtInput} ${dsMono} flex items-center justify-between`}>
              {unitLabel(unit.block, unit.number)}
              <button type="button" className="text-xs text-[#8a8580] hover:text-[#1a1a1a]" onClick={() => setUnit(null)}>cambiar</button>
            </div>
          ) : (
            <>
              <input id="rsv-unit" className={`${vtInput} ${dsMono}`} value={unitQuery} onChange={(e) => setUnitQuery(e.target.value)} placeholder="Número, ej. 126" autoComplete="off" />
              {unitOptions.length > 0 && (
                <ul role="listbox" aria-label="Unidades" className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#e4e2dd] rounded-xl shadow-md max-h-56 overflow-auto">
                  {unitOptions.map((u) => (
                    <li key={u.id}>
                      <button type="button" role="option" aria-selected={false} onClick={() => setUnit(u)} className={`${dsMono} w-full text-left px-3 py-2 text-sm hover:bg-[#f5f5f4]`}>
                        {unitLabel(u.block, u.number)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <div>
          <label htmlFor="rsv-notes" className={vtLabel}>Notas <span className="font-normal text-[#8a8580]">· opcional</span></label>
          <input id="rsv-notes" className={vtInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visitante, motivo…" />
        </div>
        {error && <VtNotice>{error}</VtNotice>}
        <Footer onCancel={onClose} submitLabel="Reservar" busy={busy} />
      </form>
    </VtDialog>
  );
}

// ===================== Liberar =====================

export function ReleaseDialog({ assignment, businessId, onClose, onDone }: { assignment: ParkingAssignmentListDTO | null; businessId: number; onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setError(null), [assignment]);
  const release = async () => {
    if (!assignment) return;
    setBusy(true);
    const res = await releaseParkingAssignmentAction({ id: assignment.id, businessId, token: parkingToken() });
    setBusy(false);
    if (!res.success) { setError(res.error || 'No se pudo liberar el cupo'); return; }
    onDone();
  };
  return (
    <VtDialog
      open={!!assignment}
      onClose={onClose}
      eyebrow="Liberar cupo"
      title={assignment ? `¿Liberar el cupo ${assignment.parkingSlotNumber}?` : ''}
      busy={busy}
      width={460}
      footer={
        <div className={vtDialogFooter}>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>Cancelar</button>
          <button type="button" className={`${vtBtn.primary} !bg-[#c8382d] hover:!bg-[#a52e25]`} onClick={release} disabled={busy}>{busy ? 'Liberando…' : 'Liberar'}</button>
        </div>
      }
    >
      {assignment && (
        <p className="text-sm text-[#4b4a46]">
          La asignación de <span className={`${dsMono} font-semibold`}>{unitLabel(assignment.propertyUnitBlock, assignment.propertyUnitNumber)}</span> ({assignment.vehiclePlate}) termina hoy y queda en el
          historial. El cupo queda libre para asignarlo de nuevo.
        </p>
      )}
      {error && <div className="mt-3"><VtNotice>{error}</VtNotice></div>}
    </VtDialog>
  );
}
