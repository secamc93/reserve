/**
 * Estado y validación de los formularios del módulo: zona (Z2), horario semanal, bloqueo y
 * nueva reserva. Los campos numéricos se guardan como texto mientras se editan.
 */

import type {
  CommonArea,
  CommonAreaSchedule,
  CommonAreaType,
  CreateReservationDTO,
  CreateRestrictionDTO,
  RestrictionType,
  UpdateCommonAreaDTO,
} from '../../domain';
import { WEEK_ORDER } from './format';
import { toMinutes } from './calendar';

// ===================== Zona =====================

export interface AreaFormState {
  commonAreaTypeId: number;
  name: string;
  description: string;
  location: string;
  maxCapacity: string;
  areaSqm: string;
  equipmentDescription: string;
  hourlyRate: string;
  depositAmount: string;
  requiresApproval: boolean;
  allowsRecurring: boolean;
  isActive: boolean;
  /** Horario básico: mismas horas para los días abiertos. */
  scheduleStart: string;
  scheduleEnd: string;
  /** Días abiertos (0 = domingo … 6 = sábado). */
  openDays: number[];
  /** El usuario tocó horario o días: solo entonces se guarda el horario semanal. */
  scheduleDirty: boolean;
  /** La zona ya tenía horas distintas por día (se edita en "Horario y bloqueos"). */
  customSchedule: boolean;
}

export type AreaFormErrors = Partial<Record<keyof AreaFormState, string>>;

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0];

export function emptyAreaForm(type?: CommonAreaType): AreaFormState {
  return {
    commonAreaTypeId: type?.id ?? 0,
    name: '',
    description: '',
    location: '',
    maxCapacity: String(type?.defaultMaxCapacity ?? 10),
    areaSqm: '',
    equipmentDescription: '',
    hourlyRate: '',
    depositAmount: '',
    requiresApproval: type?.requiresApproval ?? true,
    allowsRecurring: type?.allowsRecurring ?? false,
    isActive: true,
    scheduleStart: '08:00',
    scheduleEnd: '22:00',
    openDays: [...ALL_DAYS],
    scheduleDirty: true,
    customSchedule: false,
  };
}

const num = (v?: number) => (v === undefined || v === null ? '' : String(v));

/** Horas más repetidas entre los días abiertos y si todos coinciden. */
export function basicSchedule(schedules: CommonAreaSchedule[]): { start: string; end: string; openDays: number[]; uniform: boolean } {
  const open = schedules.filter((s) => s.isActive);
  if (open.length === 0) return { start: '08:00', end: '22:00', openDays: [], uniform: true };
  const counts = new Map<string, number>();
  for (const s of open) {
    const key = `${s.startTime.slice(0, 5)}-${s.endTime.slice(0, 5)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [start, end] = top[0].split('-');
  return { start, end, openDays: open.map((s) => s.dayOfWeek), uniform: counts.size === 1 };
}

export function areaFormFrom(area: CommonArea, schedules: CommonAreaSchedule[] = []): AreaFormState {
  const basic = basicSchedule(schedules);
  return {
    commonAreaTypeId: area.commonAreaTypeId,
    name: area.name,
    description: area.description ?? '',
    location: area.location ?? '',
    maxCapacity: String(area.maxCapacity),
    areaSqm: num(area.areaSqm),
    equipmentDescription: area.hasEquipment ? area.equipmentDescription ?? '' : '',
    hourlyRate: num(area.hourlyRate),
    depositAmount: area.requiresDeposit ? num(area.depositAmount) : '',
    requiresApproval: area.requiresApproval,
    allowsRecurring: area.allowsRecurring,
    isActive: area.isActive,
    scheduleStart: basic.start,
    scheduleEnd: basic.end,
    openDays: basic.openDays,
    scheduleDirty: false,
    customSchedule: !basic.uniform,
  };
}

/** Al elegir un tipo se proponen sus valores por defecto (capacidad, aprobación, recurrencia). */
export function applyAreaType(form: AreaFormState, type: CommonAreaType): AreaFormState {
  return {
    ...form,
    commonAreaTypeId: type.id,
    maxCapacity: type.defaultMaxCapacity ? String(type.defaultMaxCapacity) : form.maxCapacity,
    requiresApproval: type.requiresApproval,
    allowsRecurring: type.allowsRecurring,
  };
}

export function toggleDay(form: AreaFormState, day: number): AreaFormState {
  const openDays = form.openDays.includes(day) ? form.openDays.filter((d) => d !== day) : [...form.openDays, day];
  return { ...form, openDays, scheduleDirty: true };
}

/** Valor en pesos: "30.000" o "30000" → 30000 (el punto es separador de miles). */
const parseAmount = (v: string): number | undefined => {
  if (/[^\d.,\s$]/.test(v)) return NaN;
  const clean = v.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  if (!clean) return undefined;
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
};

/** Decimal simple (área en m²): acepta coma o punto decimal. */
const parseDecimal = (v: string): number | undefined => {
  const clean = v.trim().replace(',', '.');
  if (!clean) return undefined;
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
};

export function validateAreaForm(form: AreaFormState): AreaFormErrors {
  const errors: AreaFormErrors = {};
  if (!form.commonAreaTypeId) errors.commonAreaTypeId = 'Elige el tipo';
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio';
  const capacity = Number(form.maxCapacity);
  if (!Number.isInteger(capacity) || capacity < 1) errors.maxCapacity = 'Al menos 1 persona';
  const area = parseDecimal(form.areaSqm);
  if (area !== undefined && (Number.isNaN(area) || area < 0)) errors.areaSqm = 'Área inválida';
  const rate = parseAmount(form.hourlyRate);
  if (rate !== undefined && (Number.isNaN(rate) || rate < 0)) errors.hourlyRate = 'Tarifa inválida';
  const deposit = parseAmount(form.depositAmount);
  if (deposit !== undefined && (Number.isNaN(deposit) || deposit < 0)) errors.depositAmount = 'Depósito inválido';
  if (form.scheduleDirty) {
    const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!clock.test(form.scheduleStart) || !clock.test(form.scheduleEnd) || toMinutes(form.scheduleStart) >= toMinutes(form.scheduleEnd)) {
      errors.scheduleEnd = 'La apertura debe ser anterior al cierre';
    }
  }
  return errors;
}

export function areaFormToDTO(form: AreaFormState): UpdateCommonAreaDTO {
  const deposit = parseAmount(form.depositAmount);
  const equipment = form.equipmentDescription.trim();
  return {
    commonAreaTypeId: form.commonAreaTypeId,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    location: form.location.trim() || undefined,
    maxCapacity: Number(form.maxCapacity),
    areaSqm: parseDecimal(form.areaSqm),
    hasEquipment: equipment.length > 0,
    equipmentDescription: equipment || undefined,
    hourlyRate: parseAmount(form.hourlyRate),
    requiresApproval: form.requiresApproval,
    requiresDeposit: !!deposit && deposit > 0,
    depositAmount: deposit && deposit > 0 ? deposit : undefined,
    allowsRecurring: form.allowsRecurring,
    isActive: form.isActive,
  };
}

/** Horario semanal de los 7 días a partir del horario básico del formulario. */
export function basicScheduleToRows(form: AreaFormState): CommonAreaSchedule[] {
  return ALL_DAYS.map((day) => ({ dayOfWeek: day, startTime: form.scheduleStart, endTime: form.scheduleEnd, isActive: form.openDays.includes(day) }));
}

// ===================== Horario semanal =====================

export interface ScheduleRow {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

/** Siete filas (lunes … domingo); los días sin registro quedan cerrados 08:00–22:00. */
export function scheduleRows(schedules: CommonAreaSchedule[]): ScheduleRow[] {
  const byDay = new Map(schedules.map((s) => [s.dayOfWeek, s]));
  return WEEK_ORDER.map((day) => {
    const s = byDay.get(day);
    return s
      ? { dayOfWeek: day, isActive: s.isActive, startTime: s.startTime.slice(0, 5), endTime: s.endTime.slice(0, 5) }
      : { dayOfWeek: day, isActive: false, startTime: '08:00', endTime: '22:00' };
  });
}

/** Devuelve el error de la primera fila inválida (o null). */
export function validateScheduleRows(rows: ScheduleRow[]): string | null {
  const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
  for (const r of rows) {
    if (!clock.test(r.startTime) || !clock.test(r.endTime)) return 'Las horas deben tener formato HH:MM';
    if (r.isActive && toMinutes(r.startTime) >= toMinutes(r.endTime)) return 'La hora de apertura debe ser anterior al cierre';
  }
  return null;
}

// ===================== Bloqueos =====================

export const RESTRICTION_LABEL: Record<RestrictionType, string> = {
  maintenance: 'Mantenimiento',
  event: 'Evento',
  blocked: 'Bloqueo',
  holiday: 'Festivo',
};

export interface RestrictionFormState {
  restrictionType: RestrictionType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  reason: string;
}

export function validateRestriction(form: RestrictionFormState): string | null {
  if (!form.startDate || !form.endDate) return 'Indica las fechas del bloqueo';
  if (form.endDate < form.startDate) return 'La fecha final es anterior a la inicial';
  if (!form.allDay && toMinutes(form.startTime) >= toMinutes(form.endTime)) return 'La hora inicial debe ser anterior a la final';
  return null;
}

export function restrictionToDTO(form: RestrictionFormState): CreateRestrictionDTO {
  return {
    restrictionType: form.restrictionType,
    startDate: form.startDate,
    endDate: form.endDate,
    startTime: form.allDay ? undefined : form.startTime,
    endTime: form.allDay ? undefined : form.endTime,
    reason: form.reason.trim() || undefined,
  };
}

// ===================== Nueva reserva =====================

export interface ReservationFormState {
  commonAreaId: number;
  propertyUnitId: number;
  date: string;
  startTime: string;
  endTime: string;
  numberOfGuests: string;
  purpose: string;
  specialRequests: string;
}

export type ReservationFormErrors = Partial<Record<keyof ReservationFormState, string>>;

export function validateReservation(form: ReservationFormState, capacity?: number): ReservationFormErrors {
  const errors: ReservationFormErrors = {};
  if (!form.commonAreaId) errors.commonAreaId = 'Elige la zona';
  if (!form.propertyUnitId) errors.propertyUnitId = 'Elige la unidad';
  if (!form.date) errors.date = 'Elige la fecha';
  if (!form.startTime || !form.endTime || toMinutes(form.startTime) >= toMinutes(form.endTime)) errors.endTime = 'La hora final debe ser posterior a la inicial';
  const guests = Number(form.numberOfGuests);
  if (!Number.isInteger(guests) || guests < 1) errors.numberOfGuests = 'Al menos 1 persona';
  else if (capacity && guests > capacity) errors.numberOfGuests = `La capacidad máxima es ${capacity}`;
  return errors;
}

export function reservationToDTO(form: ReservationFormState): CreateReservationDTO {
  return {
    commonAreaId: form.commonAreaId,
    propertyUnitId: form.propertyUnitId,
    reservationDate: `${form.date}T00:00:00Z`,
    startTime: form.startTime,
    endTime: form.endTime,
    numberOfGuests: Number(form.numberOfGuests),
    purpose: form.purpose.trim() || undefined,
    specialRequests: form.specialRequests.trim() || undefined,
  };
}
