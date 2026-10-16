/**
 * Formulario de visita (V2 · Nueva visita en 3 pasos / editar): valores, validación por paso,
 * regla de cada tipo de visita, sugerencias por historial y conversión al DTO del back.
 * Sin React ni red.
 */

import type { CreateVisitDTO, UpdateVisitDTO, Visit, VisitListDTO, VisitType } from '../domain';
import { formatDuration, toWallClockISO, unitLabel, wallClockParts } from './visit-state';

export interface VisitFormValues {
  propertyUnitId?: number;
  visitTypeId?: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  numberOfVisitors: number;
  hasCompanions: boolean;
  hasAssets: boolean;
  notifyResident: boolean;
  notifySecurity: boolean;
  notes: string;
  /** Paso 3: vehículo con que llega. */
  hasVehicle: boolean;
  plate: string;
  brand: string;
  color: string;
}

export interface NewVisitorValues {
  dni: string;
  fullName: string;
  phone: string;
  email: string;
}

/** Hora actual redondeada al siguiente cuarto de hora ("14:15"), en hora local del navegador. */
export function nextQuarterHour(now: Date = new Date()): string {
  const d = new Date(now);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  const add = (15 - (m % 15)) % 15;
  d.setMinutes(m + add);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function emptyVisitForm(today: string, now: Date = new Date()): VisitFormValues {
  return {
    propertyUnitId: undefined,
    visitTypeId: undefined,
    date: today,
    startTime: nextQuarterHour(now),
    endTime: '',
    purpose: '',
    numberOfVisitors: 1,
    hasCompanions: false,
    hasAssets: false,
    notifyResident: true,
    notifySecurity: false,
    notes: '',
    hasVehicle: false,
    plate: '',
    brand: '',
    color: '',
  };
}

/** Valores del formulario a partir de una visita existente (para editar). */
export function visitToForm(v: Visit): VisitFormValues {
  const start = wallClockParts(v.scheduledStartTime || v.scheduledDate);
  const day = wallClockParts(v.scheduledDate);
  const end = wallClockParts(v.scheduledEndTime);
  return {
    propertyUnitId: v.propertyUnitId,
    visitTypeId: v.visitTypeId,
    date: day.date || start.date,
    startTime: start.time,
    endTime: end.time,
    purpose: v.purpose ?? '',
    numberOfVisitors: v.numberOfVisitors || 1,
    hasCompanions: v.hasCompanions,
    hasAssets: v.hasAssets,
    notifyResident: v.notifyResident,
    notifySecurity: v.notifySecurity,
    notes: v.notes ?? '',
    hasVehicle: !!v.visitorVehicleId,
    plate: '',
    brand: '',
    color: '',
  };
}

/** Paso 1: hay visitante elegido, o los datos para crearlo. */
export function validateVisitorStep(opts: { needsNewVisitor: boolean; visitor?: NewVisitorValues; hasVisitor: boolean }): string | null {
  if (opts.hasVisitor) return null;
  if (!opts.needsNewVisitor) return 'Busca al visitante por su documento';
  const v = opts.visitor;
  if (!v?.dni.trim()) return 'Escribe el documento del visitante';
  if (!v.fullName.trim()) return 'Escribe el nombre del visitante';
  if (!v.phone.trim()) return 'Escribe el teléfono del visitante';
  return null;
}

/** Paso 2: unidad, tipo, día, hora y personas. */
export function validateVisitStep(f: VisitFormValues): string | null {
  if (!f.propertyUnitId) return 'Elige la unidad que visita';
  if (!f.visitTypeId) return 'Elige el tipo de visita';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return 'Elige el día de la visita';
  if (!/^\d{2}:\d{2}$/.test(f.startTime)) return 'Elige la hora de llegada';
  if (f.endTime && f.endTime <= f.startTime) return 'La hora de salida debe ser después de la llegada';
  if (!Number.isInteger(f.numberOfVisitors) || f.numberOfVisitors < 1 || f.numberOfVisitors > 50) return 'Número de personas entre 1 y 50';
  return null;
}

/** Paso 3: si trae vehículo, la placa. */
export function validateVehicleStep(f: VisitFormValues): string | null {
  if (f.hasVehicle && !normalizePlate(f.plate)) return 'Escribe la placa del vehículo';
  return null;
}

/** "kjm 842" → "KJM842". */
export function normalizePlate(plate: string): string {
  return plate.replace(/\s+/g, '').toUpperCase();
}

/** Primer error de todo el formulario (pasos 1 a 3), o null si se puede enviar. */
export function validateVisitForm(
  f: VisitFormValues,
  opts: { needsNewVisitor: boolean; visitor?: NewVisitorValues; hasVisitor: boolean },
): string | null {
  return validateVisitorStep(opts) ?? validateVisitStep(f) ?? validateVehicleStep(f);
}

/** Regla corta de un tipo de visita para su tarjeta: "hasta 8 h", "20 min", "requiere autorización"… */
export function visitTypeRule(t: Pick<VisitType, 'requiresAuthorization' | 'requiresAssetsTracking' | 'requiresVehicleRegistration' | 'maxDurationHours' | 'defaultDurationMinutes'>): string {
  if (t.requiresAssetsTracking && t.requiresVehicleRegistration) return 'activos + vehículo';
  if (t.requiresAuthorization) return 'requiere autorización';
  if (t.maxDurationHours) return `hasta ${t.maxDurationHours} h`;
  if (t.defaultDurationMinutes) return formatDuration(t.defaultDurationMinutes);
  return '';
}

export interface VisitorHistory {
  visits: number;
  lastUnit?: string;
  /** Unidades visitadas antes, la más reciente primero (máximo 4). */
  suggested: { id: number; label: string }[];
}

/** Historial del visitante a partir de sus visitas: última unidad y unidades sugeridas. */
export function visitorHistory(rows: Pick<VisitListDTO, 'propertyUnitId' | 'propertyUnitBlock' | 'propertyUnitNumber' | 'scheduledDate'>[], total?: number): VisitorHistory {
  const sorted = [...rows].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  const seen = new Set<number>();
  const suggested: { id: number; label: string }[] = [];
  for (const r of sorted) {
    if (!r.propertyUnitId || seen.has(r.propertyUnitId)) continue;
    seen.add(r.propertyUnitId);
    suggested.push({ id: r.propertyUnitId, label: unitLabel(r.propertyUnitBlock, r.propertyUnitNumber) });
    if (suggested.length === 4) break;
  }
  return {
    visits: total ?? rows.length,
    lastUnit: sorted[0] ? unitLabel(sorted[0].propertyUnitBlock, sorted[0].propertyUnitNumber) : undefined,
    suggested,
  };
}

export function formToCreateDTO(f: VisitFormValues, visitorId: number, visitorVehicleId?: number): CreateVisitDTO {
  return {
    visitorId,
    visitorVehicleId,
    propertyUnitId: f.propertyUnitId!,
    visitTypeId: f.visitTypeId!,
    scheduledDate: toWallClockISO(f.date),
    scheduledStartTime: toWallClockISO(f.date, f.startTime),
    scheduledEndTime: f.endTime ? toWallClockISO(f.date, f.endTime) : undefined,
    purpose: f.purpose.trim() || undefined,
    numberOfVisitors: f.numberOfVisitors,
    hasCompanions: f.hasCompanions,
    hasAssets: f.hasAssets,
    notes: f.notes.trim() || undefined,
    notifyResident: f.notifyResident,
    notifySecurity: f.notifySecurity,
  };
}

export function formToUpdateDTO(f: VisitFormValues): UpdateVisitDTO {
  return {
    propertyUnitId: f.propertyUnitId,
    visitTypeId: f.visitTypeId,
    scheduledDate: toWallClockISO(f.date),
    scheduledStartTime: toWallClockISO(f.date, f.startTime),
    scheduledEndTime: f.endTime ? toWallClockISO(f.date, f.endTime) : undefined,
    purpose: f.purpose.trim(),
    numberOfVisitors: f.numberOfVisitors,
    notes: f.notes.trim(),
    notifyResident: f.notifyResident,
    notifySecurity: f.notifySecurity,
  };
}
