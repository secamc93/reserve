/**
 * K1 · Zonas y cupos: una tarjeta por zona con su ocupación y una celda por cupo coloreada por
 * estado (libre / asignado / ocupado / visitante). Al elegir una celda, su detalle aparece a la
 * derecha (en teléfono, debajo).
 */

'use client';

import { useMemo, useState } from 'react';
import { DsCard, DsChips, DsLegend, DsToolbar, dsMono } from '@shared/ui/ds';
import type { ParkingSlotListDTO } from '../domain';
import type { ParkingData } from './use-parking-data';
import {
  SLOT_STYLE,
  isLiveReservation,
  matchesMapFilter,
  shortSlotNumber,
  slotState,
  zoneSummary,
  type MapFilter,
  type SlotState,
} from './parking-view-model';
import { SlotDetail } from './slot-detail';

interface SlotMapProps {
  data: ParkingData;
  today: Date;
  onAssign: (slot: ParkingSlotListDTO) => void;
  onEditAssignment: (slot: ParkingSlotListDTO) => void;
  onRelease: (slot: ParkingSlotListDTO) => void;
  onCreateSlots: () => void;
}

export function SlotMap({ data, today, onAssign, onEditAssignment, onRelease, onCreateSlots }: SlotMapProps) {
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const stateOf = useMemo(() => {
    const m = new Map<number, SlotState>();
    for (const slot of data.slots) {
      const live = (data.reservationsBySlot.get(slot.id) ?? []).some(isLiveReservation);
      m.set(slot.id, slotState(slot, live));
    }
    return m;
  }, [data]);

  const zones = useMemo(
    () =>
      data.zones.map((zone) => {
        const slots = data.slots.filter((s) => s.parkingZoneId === zone.id);
        return { zone, slots, summary: zoneSummary(slots.map((s) => stateOf.get(s.id) ?? 'free')) };
      }),
    [data, stateOf],
  );

  const count = (f: MapFilter) => data.slots.filter((s) => matchesMapFilter(f, s, stateOf.get(s.id) ?? 'free')).length;
  const selected = data.slots.find((s) => s.id === selectedId) ?? null;

  if (data.zones.length === 0) {
    return (
      <DsCard className="p-10 text-center">
        <div className="text-[15px] font-semibold">Aún no hay zonas de parqueo</div>
        <p className="mt-1 text-sm text-[#8a8580]">Crea una zona (sótano, visitantes…) y luego sus cupos.</p>
      </DsCard>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] items-start">
      <div className="flex flex-col gap-3.5 min-w-0">
        <DsToolbar
          left={
            <DsChips
              ariaLabel="Filtrar cupos"
              active={filter}
              onChange={setFilter}
              chips={[
                { id: 'all', label: 'Todos' },
                { id: 'free', label: 'Libres', count: count('free') },
                { id: 'occupied', label: 'Ocupados ahora', count: count('occupied') },
                { id: 'charger', label: 'Con cargador', count: count('charger') },
                { id: 'moto', label: 'Motos', count: count('moto') },
              ]}
            />
          }
          right={
            <DsLegend
              items={(['free', 'assigned', 'occupied', 'visitor'] as SlotState[]).map((s) => ({
                label: SLOT_STYLE[s].label,
                swatch: { background: SLOT_STYLE[s].bg, border: s === 'free' ? `1px solid ${SLOT_STYLE[s].border}` : undefined },
              }))}
            />
          }
        />
        {zones.map(({ zone, slots, summary }) => {
          const visible = slots.filter((s) => matchesMapFilter(filter, s, stateOf.get(s.id) ?? 'free'));
          return (
            <DsCard key={zone.id} className="px-[18px] py-3.5 grid gap-[18px] md:grid-cols-[150px_1fr] items-start">
              <div>
                <div className="text-sm font-semibold">{zone.name}</div>
                <div className="text-[11px] text-[#8a8580] mt-0.5">
                  {[zone.location, `${summary.total} cupos`].filter(Boolean).join(' · ')}
                </div>
                <div className={`${dsMono} text-[11px] text-[#4b4a46] mt-2`}>
                  {summary.occupied} ocupados
                  <br />
                  {summary.free} libres
                </div>
                <div className="h-1 bg-[#efedea] rounded-full mt-2" aria-hidden="true">
                  <div className="h-full bg-[#18A0AE] rounded-full" style={{ width: `${summary.pct}%` }} />
                </div>
              </div>
              {slots.length === 0 ? (
                <div className="text-sm text-[#8a8580] py-2">
                  Sin cupos.{' '}
                  <button type="button" onClick={onCreateSlots} className="underline underline-offset-2 hover:text-[#c8603f]">Crear cupos</button>
                </div>
              ) : visible.length === 0 ? (
                <div className="text-sm text-[#8a8580] py-2">Ningún cupo de esta zona cumple el filtro.</div>
              ) : (
                <div className="grid gap-[5px] grid-cols-[repeat(auto-fill,minmax(38px,1fr))]" role="group" aria-label={`Cupos de ${zone.name}`}>
                  {visible.map((slot) => {
                    const st = SLOT_STYLE[stateOf.get(slot.id) ?? 'free'];
                    const on = slot.id === selectedId;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        title={`${slot.slotNumber} · ${st.label}`}
                        aria-label={`Cupo ${slot.slotNumber}, ${st.label}`}
                        aria-pressed={on}
                        onClick={() => setSelectedId(slot.id)}
                        className={`${dsMono} h-[34px] rounded flex items-center justify-center text-[10px] font-medium transition-transform hover:scale-105`}
                        style={{
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                          color: st.fg,
                          boxShadow: on ? '0 0 0 2px #fff, 0 0 0 4px #c8603f' : 'none',
                        }}
                      >
                        {shortSlotNumber(slot.slotNumber)}
                      </button>
                    );
                  })}
                </div>
              )}
            </DsCard>
          );
        })}
      </div>
      <SlotDetail
        slot={selected}
        state={selected ? stateOf.get(selected.id) ?? 'free' : null}
        assignment={selected ? data.assignmentBySlot.get(selected.id) ?? null : null}
        reservations={selected ? data.reservationsBySlot.get(selected.id) ?? [] : []}
        today={today}
        onAssign={onAssign}
        onEditAssignment={onEditAssignment}
        onRelease={onRelease}
      />
    </div>
  );
}
