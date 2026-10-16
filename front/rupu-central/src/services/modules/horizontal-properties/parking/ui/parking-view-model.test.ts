import { describe, expect, it } from 'vitest';
import {
  assignmentStatus,
  bulkPreview,
  dayNavLabel,
  formatRange,
  isLiveReservation,
  matchesMapFilter,
  reservationState,
  shortSlotNumber,
  slotDimensions,
  slotState,
  unitLabel,
  vehicleLabel,
  zoneSummary,
} from './parking-view-model';

const today = new Date(2026, 9, 15); // 15 oct 2026

describe('mapa de cupos', () => {
  it('estado: visitante > ocupado > asignado > libre', () => {
    expect(slotState({ isOccupied: true, isAssigned: true }, true)).toBe('visitor');
    expect(slotState({ isOccupied: true, isAssigned: true })).toBe('occupied');
    expect(slotState({ isOccupied: false, isAssigned: true })).toBe('assigned');
    expect(slotState({ isOccupied: false, isAssigned: false })).toBe('free');
  });
  it('reserva viva: ni cancelada ni con salida', () => {
    expect(isLiveReservation({ statusName: 'Confirmada', checkedOutAt: undefined })).toBe(true);
    expect(isLiveReservation({ statusName: 'Cancelada', checkedOutAt: undefined })).toBe(false);
    expect(isLiveReservation({ statusName: 'En curso', checkedOutAt: '2026-10-15T10:00:00Z' })).toBe(false);
  });
  it('número corto para la celda', () => {
    expect(shortSlotNumber('P2-114')).toBe('114');
    expect(shortSlotNumber('V-03')).toBe('03');
    expect(shortSlotNumber('12')).toBe('12');
  });
  it('resumen por zona', () => {
    expect(zoneSummary(['free', 'assigned', 'occupied', 'visitor'])).toEqual({ total: 4, occupied: 2, free: 1, pct: 75 });
    expect(zoneSummary([])).toEqual({ total: 0, occupied: 0, free: 0, pct: 0 });
  });
  it('filtros del mapa', () => {
    const car = { hasCharger: true, parkingTypeName: 'Carro' };
    expect(matchesMapFilter('free', car, 'free')).toBe(true);
    expect(matchesMapFilter('occupied', car, 'visitor')).toBe(true);
    expect(matchesMapFilter('charger', car, 'assigned')).toBe(true);
    expect(matchesMapFilter('moto', car, 'free')).toBe(false);
    expect(matchesMapFilter('moto', { hasCharger: false, parkingTypeName: 'Moto' }, 'free')).toBe(true);
  });
  it('medidas', () => {
    expect(slotDimensions({ width: 2.5, length: 5, height: null })).toBe('2,5 × 5,0 m');
    expect(slotDimensions({ width: null, length: 5, height: null })).toBeNull();
  });
});

describe('asignaciones', () => {
  it('vigencia', () => {
    expect(assignmentStatus({ isActive: true, endDate: undefined }, today)).toMatchObject({ label: 'Vigente' });
    expect(assignmentStatus({ isActive: true, endDate: '2026-10-31' }, today)).toMatchObject({ label: 'Vence en 16 días' });
    expect(assignmentStatus({ isActive: true, endDate: '2026-09-30' }, today)).toMatchObject({ label: 'Vencida' });
    expect(assignmentStatus({ isActive: true, endDate: '2026-12-31' }, today)).toMatchObject({ label: 'Vigente' });
    expect(assignmentStatus({ isActive: false, endDate: '2026-10-15' }, today)).toMatchObject({ label: 'Liberada' });
  });
  it('rango de fechas', () => {
    expect(formatRange('2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z')).toBe('01 ene 2026 → 31 dic 2026');
    expect(formatRange('2025-03-15', null)).toBe('15 mar 2025 → indefinido');
  });
  it('unidad y vehículo', () => {
    expect(unitLabel('Casa', '126')).toBe('Casa 126');
    expect(unitLabel('', '7')).toBe('7');
    expect(unitLabel('Casa', '')).toBe('—');
    expect(vehicleLabel('Mazda', 'CX-30', 'gris')).toBe('Mazda CX-30 · gris');
    expect(vehicleLabel()).toBe('—');
  });
});

describe('reservas de visitantes', () => {
  const base = { statusName: 'Confirmada', reservationDate: '2026-10-15', endTime: '11:00:00', checkedInAt: undefined, checkedOutAt: undefined };
  it('estados', () => {
    expect(reservationState(base, new Date(2026, 9, 15, 9, 0))).toBe('wait');
    expect(reservationState({ ...base, checkedInAt: 'x' }, new Date(2026, 9, 15, 10, 0))).toBe('in');
    expect(reservationState({ ...base, checkedInAt: 'x' }, new Date(2026, 9, 15, 11, 30))).toBe('over');
    expect(reservationState({ ...base, checkedInAt: 'x', checkedOutAt: 'y' }, new Date(2026, 9, 15, 12, 0))).toBe('done');
    expect(reservationState({ ...base, statusName: 'Cancelada' }, new Date(2026, 9, 15, 9, 0))).toBe('cancelled');
  });
  it('etiqueta del día', () => {
    expect(dayNavLabel(today, today)).toBe('Hoy · jue 15 oct');
    expect(dayNavLabel(new Date(2026, 9, 16), today)).toBe('Mañana · vie 16 oct');
  });
});

describe('cupos nuevos', () => {
  it('vista previa de la numeración', () => {
    expect(bulkPreview('P2-', 121, 132, 3)).toEqual({ count: 12, first: 'P2-121', last: 'P2-132' });
    expect(bulkPreview('V-', 1, 9, 2)).toEqual({ count: 9, first: 'V-01', last: 'V-09' });
    expect(bulkPreview('P', 5, 4, 0)).toBeNull();
  });
});
