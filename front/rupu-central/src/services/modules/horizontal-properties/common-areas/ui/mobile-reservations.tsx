/**
 * Z5 · Reservas en el teléfono: título "Reservas" + "semana · 14", chips Pendientes / Hoy /
 * Semana y tarjetas (radio 12 px) con estado, hace cuánto se pidió, zona, horario,
 * invitados, unidad, depósito o cruce, y Aprobar / Rechazar (o "Ver conflicto").
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DS, DsChips, dsMono } from '@/shared/ui/ds';
import type { ReservationListDTO } from '../domain';
import { findConflicts, formatThousands, isInactiveStatus, relativeDay, reservationDay, statusMeta, timeAgo, unitLabel } from './design';

type MobileFilter = 'pending' | 'today' | 'week';

export interface MobileReservationsProps {
  pending: ReservationListDTO[];
  pendingTotal: number;
  week: ReservationListDTO[];
  today: string;
  zonesHref: string;
  approvingId: number | null;
  onApprove: (r: ReservationListDTO) => void;
  onOpen: (id: number) => void;
}

export function MobileReservations({ pending, pendingTotal, week, today, zonesHref, approvingId, onApprove, onOpen }: MobileReservationsProps) {
  const [filter, setFilter] = useState<MobileFilter>('pending');
  const active = week.filter((r) => !isInactiveStatus(r.statusCode));
  const ofToday = active.filter((r) => reservationDay(r.reservationDate) === today);
  const list = filter === 'pending' ? pending : filter === 'today' ? ofToday : active;
  const sorted = [...list].sort((a, b) => (a.reservationDate + a.startTime).localeCompare(b.reservationDate + b.startTime));

  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h1 className="m-0 text-[22px] font-semibold tracking-[-.02em]">Reservas</h1>
        <div className="flex items-baseline gap-3">
          <span className={`${dsMono} text-xs text-[#8a8580]`}>semana · {active.length}</span>
          <Link href={zonesHref} className="text-xs font-medium text-[#c8603f]">
            Zonas
          </Link>
        </div>
      </div>

      <DsChips<MobileFilter>
        ariaLabel="Filtro de reservas"
        chips={[
          { id: 'pending', label: 'Pendientes', count: pendingTotal },
          { id: 'today', label: 'Hoy', count: ofToday.length },
          { id: 'week', label: 'Semana' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {sorted.length === 0 ? (
        <p className="text-center text-sm text-[#8a8580] py-10 m-0">{filter === 'pending' ? 'No hay reservas por aprobar' : 'Sin reservas'}</p>
      ) : (
        <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
          {sorted.map((r) => {
            const isPending = r.statusCode === 'pending';
            const meta = statusMeta(r.statusCode, r.statusName);
            const conflicts = isPending ? findConflicts(r, week) : [];
            const unit = unitLabel(r.propertyUnitNumber, r.propertyUnitBlock);
            return (
              <li key={r.id}>
                <article aria-label={`Reserva de ${unit} en ${r.commonAreaName}`} className="bg-white border border-[#e4e2dd] rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`${dsMono} px-2 py-[3px] rounded text-[10px] font-semibold tracking-[.06em] uppercase`}
                      style={isPending ? { background: '#fbe9e4', color: DS.accent } : { background: meta.bg, color: meta.fg }}
                    >
                      {isPending ? 'Pendiente' : meta.label}
                    </span>
                    <span className={`${dsMono} text-[11px] text-[#8a8580]`}>{isPending ? timeAgo(r.createdAt) : relativeDay(reservationDay(r.reservationDate))}</span>
                  </div>
                  <div className="text-[17px] font-semibold tracking-[-.01em]">{r.commonAreaName}</div>
                  <div className={`${dsMono} text-xs text-[#4b4a46]`}>
                    {relativeDay(reservationDay(r.reservationDate))} {r.startTime}–{r.endTime} · {r.numberOfGuests} inv. · {unit}
                    {r.residentName ? ` ${r.residentName}` : ''}
                  </div>
                  {conflicts.length > 0 ? (
                    <div className="text-xs text-[#c8603f]">
                      Se cruza con {unitLabel(conflicts[0].propertyUnitNumber, conflicts[0].propertyUnitBlock)} · {conflicts[0].startTime}–{conflicts[0].endTime}
                    </div>
                  ) : r.depositAmount && !r.depositPaid ? (
                    <div className="text-xs text-[#c8603f]">Requiere depósito · {formatThousands(r.depositAmount)}</div>
                  ) : null}
                  {isPending ? (
                    <div className="flex gap-2 pt-1">
                      {conflicts.length > 0 ? (
                        <button type="button" className="flex-1 h-11 rounded-xl text-sm font-semibold bg-white text-[#c8603f] border border-[#c8603f]" onClick={() => onOpen(r.id)}>
                          Ver conflicto
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="flex-1 h-11 rounded-full text-sm font-semibold bg-[#0F7F8A] text-white disabled:opacity-50"
                          onClick={() => onApprove(r)}
                          disabled={approvingId === r.id}
                          aria-label={`Aprobar reserva de ${unit}`}
                        >
                          {approvingId === r.id ? 'Aprobando…' : 'Aprobar'}
                        </button>
                      )}
                      <button type="button" className="h-11 px-4 rounded-xl text-sm font-semibold bg-white text-[#c8382d] border border-[#c8382d]" onClick={() => onOpen(r.id)} aria-label={`Rechazar reserva de ${unit}`}>
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="self-start text-xs font-medium text-[#4b4a46] underline" onClick={() => onOpen(r.id)}>
                      Ver detalle
                    </button>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
