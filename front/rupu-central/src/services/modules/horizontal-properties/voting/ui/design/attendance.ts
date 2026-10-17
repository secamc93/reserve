/**
 * Asistencia del grupo (A4): filas, filtros y resumen por coeficiente.
 * Lógica pura sobre los registros de la lista de asistencia del back.
 */

import { formatUnitLabel } from '../../../units/domain/unit-display';

/** Registro de `GET /attendance/lists/:id/records` (formato del back). */
export interface AttendanceRecordRaw {
  id: number;
  property_unit_id: number;
  unit_number?: string | null;
  /** Bloque/tipo de la unidad ("Casa", "Dúplex", "Local"). */
  unit_block?: string | null;
  resident_name?: string | null;
  proxy_name?: string | null;
  attended_as_owner?: boolean;
  attended_as_proxy?: boolean;
}

export interface AttendanceRow {
  /** Id del registro en la lista; null si la unidad aún no tiene registro (nunca se marcó). */
  recordId: number | null;
  unitId: number;
  /** Nombre visible de la unidad: tipo + número ("Casa 12", "Dúplex 3"). */
  unitNumber: string;
  residentName: string;
  proxyName: string;
  present: boolean;
  byProxy: boolean;
  /** Coeficiente de la unidad como % del total de la propiedad. */
  coefPct: number;
}

/** Unidad de la propiedad (para incluir las que aún no tienen registro de asistencia). */
export interface AttendanceUnitInput {
  id: number;
  number: string;
  block?: string | null;
  coefficient?: number | null;
  residentName?: string | null;
}

export type AttendanceFilter = 'all' | 'present' | 'absent' | 'proxy';

const byUnit = (a: AttendanceRow, b: AttendanceRow) =>
  a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true, sensitivity: 'base' });

/**
 * Une los registros de la lista con las unidades de la propiedad: cada unidad aparece una vez
 * (las que no tienen registro, como ausentes). Los coeficientes pueden venir como fracción
 * (suman 1) o como porcentaje (suman 100): se expresan como % del total de la propiedad.
 */
export function buildAttendanceRows(records: AttendanceRecordRaw[], units: AttendanceUnitInput[]): AttendanceRow[] {
  const coefOf = new Map(units.map((u) => [u.id, Number(u.coefficient) || 0]));
  const totalCoef = Array.from(coefOf.values()).reduce((sum, c) => sum + c, 0);
  const pct = (unitId: number) => (totalCoef > 0 ? ((coefOf.get(unitId) ?? 0) / totalCoef) * 100 : 0);

  const rows: AttendanceRow[] = records.map((r) => {
    const unit = units.find((u) => u.id === r.property_unit_id);
    return {
      recordId: r.id,
      unitId: r.property_unit_id,
      unitNumber: r.unit_number || unit?.number
        ? formatUnitLabel(r.unit_number || unit?.number, r.unit_block || unit?.block)
        : `#${r.property_unit_id}`,
      residentName: (r.resident_name || unit?.residentName || '').trim() || 'Sin residente',
      proxyName: (r.proxy_name || '').trim(),
      present: !!r.attended_as_owner || !!r.attended_as_proxy,
      byProxy: !!r.attended_as_proxy,
      coefPct: pct(r.property_unit_id),
    };
  });
  const withRecord = new Set(records.map((r) => r.property_unit_id));
  units
    .filter((u) => !withRecord.has(u.id))
    .forEach((u) =>
      rows.push({
        recordId: null,
        unitId: u.id,
        unitNumber: formatUnitLabel(u.number, u.block),
        residentName: (u.residentName || '').trim() || 'Sin residente',
        proxyName: '',
        present: false,
        byProxy: false,
        coefPct: pct(u.id),
      })
    );
  return rows.sort(byUnit);
}

/** Filtra por pestaña (Todas / Presentes / Ausentes / Con poder) y por texto (unidad o residente). */
export function filterAttendanceRows(rows: AttendanceRow[], filter: AttendanceFilter, term: string): AttendanceRow[] {
  const q = term.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter === 'present' && !row.present) return false;
    if (filter === 'absent' && row.present) return false;
    if (filter === 'proxy' && !row.proxyName) return false;
    if (!q) return true;
    return (
      row.unitNumber.toLowerCase().includes(q) ||
      row.residentName.toLowerCase().includes(q) ||
      row.proxyName.toLowerCase().includes(q)
    );
  });
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  proxy: number;
  /** Presentes por coeficiente (% del total de la propiedad). */
  presentCoefPct: number;
}

export function summarizeAttendance(rows: AttendanceRow[]): AttendanceSummary {
  const present = rows.filter((r) => r.present);
  return {
    total: rows.length,
    present: present.length,
    absent: rows.length - present.length,
    proxy: rows.filter((r) => !!r.proxyName).length,
    presentCoefPct: Math.min(100, present.reduce((sum, r) => sum + r.coefPct, 0)),
  };
}

/** Marca o desmarca la asistencia de una fila (actualización optimista). */
export function setRowPresence(rows: AttendanceRow[], unitId: number, present: boolean): AttendanceRow[] {
  return rows.map((r) => (r.unitId === unitId ? { ...r, present, byProxy: present ? r.byProxy : false } : r));
}
