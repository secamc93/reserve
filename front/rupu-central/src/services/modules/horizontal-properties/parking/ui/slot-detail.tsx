/**
 * Detalle del cupo elegido en el mapa (K1, panel derecho): zona, estado, número, atributos,
 * a quién está asignado, vehículo, vigencia y movimientos de hoy, con las acciones del cupo.
 */

'use client';

import { DsEyebrow, DsPlate, DsStatus, DsTag, dsMono, vtBtn } from '@shared/ui/ds';
import type { ParkingAssignmentListDTO, ParkingReservationListDTO, ParkingSlotListDTO } from '../domain';
import {
  SLOT_STYLE,
  assignmentStatus,
  daysBetween,
  formatRange,
  parseDay,
  slotDimensions,
  timeRange,
  unitLabel,
  vehicleLabel,
  type SlotState,
} from './parking-view-model';

interface SlotDetailProps {
  slot: ParkingSlotListDTO | null;
  state: SlotState | null;
  assignment: ParkingAssignmentListDTO | null;
  reservations: ParkingReservationListDTO[];
  today: Date;
  onAssign: (slot: ParkingSlotListDTO) => void;
  onEditAssignment: (slot: ParkingSlotListDTO) => void;
  onRelease: (slot: ParkingSlotListDTO) => void;
}

export function SlotDetail({ slot, state, assignment, reservations, today, onAssign, onEditAssignment, onRelease }: SlotDetailProps) {
  if (!slot || !state) {
    return (
      <aside className="bg-white border border-[#e4e2dd] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] p-6 text-center text-sm text-[#8a8580] lg:sticky lg:top-[68px]">
        Elige un cupo del mapa para ver su asignación, vehículo y movimientos.
      </aside>
    );
  }
  const style = SLOT_STYLE[state];
  const dims = slotDimensions(slot);
  const status = assignment ? assignmentStatus(assignment, today) : null;
  const daysLeft = assignment?.endDate ? daysBetween(today, parseDay(assignment.endDate)) : null;

  return (
    <aside aria-label={`Cupo ${slot.slotNumber}`} className="bg-white border border-[#e4e2dd] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] flex flex-col overflow-hidden lg:sticky lg:top-[68px]">
      <div className="px-5 pt-[18px] pb-3.5 border-b border-[#e4e2dd]">
        <div className="flex justify-between items-center">
          <DsEyebrow>Cupo · {slot.parkingZoneName}</DsEyebrow>
          <DsStatus label={style.label} color={state === 'free' ? '#8a8580' : state === 'visitor' ? '#c8603f' : state === 'occupied' ? '#0F7F8A' : '#8a8580'} />
        </div>
        <div className={`${dsMono} text-[30px] font-semibold tracking-[-.03em] mt-1.5`}>{slot.slotNumber}</div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {slot.parkingTypeName && <DsTag>{slot.parkingTypeName}</DsTag>}
          <DsTag>{slot.isCovered ? 'Cubierto' : 'Descubierto'}</DsTag>
          {dims && <DsTag>{dims}</DsTag>}
          {slot.hasCharger && <DsTag strong>Cargador EV</DsTag>}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4 flex-1">
        <div>
          <DsEyebrow className="mb-2">Asignado a</DsEyebrow>
          {assignment ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 border border-[#e4e2dd] rounded-2xl">
              <span className={`${dsMono} text-[15px] font-semibold`}>{unitLabel(assignment.propertyUnitBlock, assignment.propertyUnitNumber)}</span>
              <div className="flex-1 min-w-0 text-[13px]">
                <div className="font-semibold truncate">{assignment.residentName || 'Sin residente'}</div>
                <div className="text-[11px] text-[#8a8580]">desde {formatRange(assignment.startDate).split(' →')[0]}</div>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[#8a8580]">Sin asignación permanente.</p>
          )}
        </div>

        {assignment && (
          <div>
            <DsEyebrow className="mb-2">Vehículo</DsEyebrow>
            <div className="flex items-center gap-3">
              <DsPlate size="lg">{assignment.vehiclePlate}</DsPlate>
              <div className="text-[13px]">{vehicleLabel(assignment.vehicleBrand, assignment.vehicleModel, assignment.vehicleColor)}</div>
            </div>
          </div>
        )}

        {assignment && (
          <div>
            <DsEyebrow className="mb-2">Vigencia</DsEyebrow>
            <div className="flex justify-between gap-3 text-[13px]">
              <span className={dsMono}>{formatRange(assignment.startDate, assignment.endDate)}</span>
              {status && (
                <span className="text-xs shrink-0" style={{ color: status.color }}>
                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} días` : status.label}
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          <DsEyebrow className="mb-2">Hoy</DsEyebrow>
          {reservations.length === 0 ? (
            <p className="text-xs text-[#4b4a46]">Sin reservas de visitantes hoy.</p>
          ) : (
            <ul className="text-xs text-[#4b4a46] leading-relaxed">
              {reservations.map((r) => (
                <li key={r.id}>
                  <span className={dsMono}>{timeRange(r.startTime, r.endTime)}</span> · {r.visitorName || r.residentName || 'Visitante'} ·{' '}
                  <span className={dsMono}>{r.vehiclePlate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e4e2dd] flex gap-2">
        {assignment ? (
          <>
            <button type="button" className={`${vtBtn.secondary} flex-1`} onClick={() => onEditAssignment(slot)}>
              Editar asignación
            </button>
            <button type="button" className={`${vtBtn.secondary} !text-[#c8382d] !border-[#c8382d]`} onClick={() => onRelease(slot)}>
              Liberar
            </button>
          </>
        ) : (
          <button type="button" className={`${vtBtn.primary} flex-1`} onClick={() => onAssign(slot)} disabled={!slot.isActive}>
            Asignar este cupo
          </button>
        )}
      </div>
    </aside>
  );
}
