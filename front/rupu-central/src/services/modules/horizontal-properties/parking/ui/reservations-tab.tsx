/**
 * K4 · Reservas de visitantes por día: navegación de días (‹ Hoy ›), chips Hoy / Mañana /
 * Semana / Historial, y por reserva su horario, cupo, visitante, unidad que recibe, placa,
 * estado y la acción que toca (check-in / check-out).
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { DsChips, DsPlate, DsStatus, DsTable, DsToolbar, dsMono, type DsColumn } from '@shared/ui/ds';
import { fetchAllPages } from '@shared/utils/pagination';
import { checkInParkingAction, checkOutParkingAction, getParkingReservationsAction } from '../infrastructure/actions';
import type { ParkingReservationListDTO } from '../domain';
import { parkingToken } from './use-parking-data';
import { RESERVATION_STYLE, dayNavLabel, formatDay, minutesOf, reservationState, timeRange, toISODay, unitLabel } from './parking-view-model';

type Range = 'day' | 'week' | 'history';

interface ReservationsTabProps {
  businessId: number;
  today: Date;
  version: number;
  /** Cupos de visitantes de la propiedad (para el resumen del día). */
  visitorSlots: number;
  onChanged: () => void;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function ReservationsTab({ businessId, today, version, visitorSlots, onChanged }: ReservationsTabProps) {
  const [range, setRange] = useState<Range>('day');
  const [day, setDay] = useState<Date>(today);
  const [rows, setRows] = useState<ParkingReservationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [from, to] = useMemo(() => {
    if (range === 'week') return [day, addDays(day, 6)];
    if (range === 'history') return [addDays(today, -30), addDays(today, -1)];
    return [day, day];
  }, [range, day, today]);

  useEffect(() => {
    let alive = true;
    const token = parkingToken();
    setLoading(true);
    setError(null);
    fetchAllPages((page, pageSize) =>
      getParkingReservationsAction({ businessId, token, startDate: toISODay(from), endDate: toISODay(to), page, pageSize }).then((r) => ({
        items: r.data,
        total: r.total,
        totalPages: r.totalPages,
      })),
    )
      .then((list) => {
        if (!alive) return;
        list.sort((a, b) => a.reservationDate.localeCompare(b.reservationDate) || minutesOf(a.startTime) - minutesOf(b.startTime));
        setRows(range === 'history' ? list.reverse() : list);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'No se pudieron cargar las reservas'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [businessId, from, to, range, version]);

  const act = async (r: ParkingReservationListDTO, action: 'check-in' | 'check-out') => {
    setBusyId(r.id);
    setError(null);
    const token = parkingToken();
    const res = action === 'check-in' ? await checkInParkingAction({ id: r.id, token }) : await checkOutParkingAction({ id: r.id, token });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || 'No se pudo registrar el movimiento');
      return;
    }
    onChanged();
  };

  const states = rows.map((r) => reservationState(r, now));
  const inside = states.filter((s) => s === 'in' || s === 'over').length;
  const live = states.filter((s) => s !== 'cancelled').length;

  const columns: DsColumn<ParkingReservationListDTO>[] = [
    {
      key: 'time',
      label: range === 'day' ? 'Horario' : 'Fecha · horario',
      width: range === 'day' ? '110px' : '170px',
      render: (r) => (
        <span className={`${dsMono} text-xs`}>
          {range !== 'day' && <>{formatDay(r.reservationDate).slice(0, 6)} · </>}
          {timeRange(r.startTime, r.endTime)}
        </span>
      ),
    },
    { key: 'slot', label: 'Cupo', width: '90px', render: (r) => <span className={`${dsMono} font-semibold text-[#c8603f]`}>{r.parkingSlotNumber}</span> },
    {
      key: 'visitor',
      label: 'Visitante',
      width: '1fr',
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{r.visitorName || 'Visitante'}</div>
        </div>
      ),
    },
    {
      key: 'unit',
      label: 'Unidad que recibe',
      width: '1fr',
      render: (r) => (
        <span className="truncate">
          <span className={`${dsMono} text-xs`}>{unitLabel('', r.propertyUnitNumber)}</span>
          {r.residentName && <span className="text-[#4b4a46]"> · {r.residentName}</span>}
        </span>
      ),
    },
    { key: 'plate', label: 'Placa', width: '110px', render: (r) => (r.vehiclePlate ? <DsPlate>{r.vehiclePlate}</DsPlate> : <span className="text-[#8a8580]">—</span>) },
    {
      key: 'status',
      label: 'Estado',
      width: '150px',
      render: (r) => {
        const s = RESERVATION_STYLE[reservationState(r, now)];
        return <DsStatus label={s.label} color={s.color} />;
      },
    },
    {
      key: 'action',
      label: 'Acción',
      width: '120px',
      align: 'right',
      render: (r) => {
        const s = RESERVATION_STYLE[reservationState(r, now)];
        if (!s.action) return null;
        const primary = s.action === 'check-in';
        return (
          <button
            type="button"
            disabled={busyId !== null}
            onClick={() => act(r, s.action!)}
            className={`h-[30px] px-3 rounded-md text-xs font-semibold border disabled:opacity-50 ${
              primary ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#c8603f] hover:border-[#c8603f]' : 'bg-white text-[#1a1a1a] border-[#d6d3cd] hover:bg-[#f5f5f4]'
            }`}
          >
            {busyId === r.id ? '…' : primary ? 'Check-in' : 'Check-out'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <DsToolbar
        left={
          <div className="flex flex-wrap items-center gap-2.5">
            {range !== 'history' && (
              <div className="flex border border-[#d6d3cd] rounded-md overflow-hidden bg-white">
                <button type="button" aria-label="Día anterior" onClick={() => setDay((d) => addDays(d, range === 'week' ? -7 : -1))} className="px-2.5 py-[5px] border-r border-[#d6d3cd] text-[#8a8580] hover:text-[#1a1a1a]">‹</button>
                <span className={`${dsMono} px-3 py-[5px] text-xs font-semibold`}>
                  {range === 'week' ? `${formatDay(toISODay(from)).slice(0, 6)} – ${formatDay(toISODay(to)).slice(0, 6)}` : dayNavLabel(day, today)}
                </span>
                <button type="button" aria-label="Día siguiente" onClick={() => setDay((d) => addDays(d, range === 'week' ? 7 : 1))} className="px-2.5 py-[5px] border-l border-[#d6d3cd] text-[#8a8580] hover:text-[#1a1a1a]">›</button>
              </div>
            )}
            <span className="text-xs text-[#8a8580]">
              {visitorSlots} cupos de visitantes · {live} reservados{range === 'day' && toISODay(day) === toISODay(today) ? ` · ${inside} dentro ahora` : ''}
            </span>
          </div>
        }
        right={
          <DsChips
            ariaLabel="Periodo"
            active={range === 'day' ? (toISODay(day) === toISODay(today) ? 'today' : toISODay(day) === toISODay(addDays(today, 1)) ? 'tomorrow' : 'other') : range}
            onChange={(id) => {
              if (id === 'today') { setRange('day'); setDay(today); }
              else if (id === 'tomorrow') { setRange('day'); setDay(addDays(today, 1)); }
              else if (id === 'week') { setRange('week'); setDay(today); }
              else if (id === 'history') setRange('history');
            }}
            chips={[
              { id: 'today', label: 'Hoy' },
              { id: 'tomorrow', label: 'Mañana' },
              { id: 'week', label: 'Semana' },
              { id: 'history', label: 'Historial' },
            ]}
          />
        }
      />
      {error && <p role="alert" className="text-sm text-[#c8382d]">{error}</p>}
      <DsTable ariaLabel="Reservas de visitantes" columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No hay reservas de visitantes en este periodo" minWidth={900} />
    </div>
  );
}
