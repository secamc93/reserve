/**
 * Formulario de visita (V2 · Nueva visita / editar): valores, validación y conversión al DTO
 * del back. Sin React ni red.
 */

import type { CreateVisitDTO, UpdateVisitDTO, Visit } from '../domain';
import { toWallClockISO, wallClockParts } from './visit-state';

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
  };
}

/** Primer error del formulario, o null si se puede enviar. */
export function validateVisitForm(
  f: VisitFormValues,
  opts: { needsNewVisitor: boolean; visitor?: NewVisitorValues; hasVisitor: boolean },
): string | null {
  if (!opts.hasVisitor) {
    if (!opts.needsNewVisitor) return 'Busca al visitante por su documento';
    const v = opts.visitor;
    if (!v?.dni.trim()) return 'Escribe el documento del visitante';
    if (!v.fullName.trim()) return 'Escribe el nombre del visitante';
    if (!v.phone.trim()) return 'Escribe el teléfono del visitante';
  }
  if (!f.propertyUnitId) return 'Elige la unidad que visita';
  if (!f.visitTypeId) return 'Elige el tipo de visita';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return 'Elige el día de la visita';
  if (!/^\d{2}:\d{2}$/.test(f.startTime)) return 'Elige la hora de llegada';
  if (f.endTime && f.endTime <= f.startTime) return 'La hora de salida debe ser después de la llegada';
  if (!Number.isInteger(f.numberOfVisitors) || f.numberOfVisitors < 1 || f.numberOfVisitors > 50) return 'Número de personas entre 1 y 50';
  return null;
}

export function formToCreateDTO(f: VisitFormValues, visitorId: number): CreateVisitDTO {
  return {
    visitorId,
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
