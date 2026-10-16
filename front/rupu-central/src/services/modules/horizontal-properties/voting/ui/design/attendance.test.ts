import { describe, expect, it } from 'vitest';
import { buildAttendanceRows, filterAttendanceRows, setRowPresence, summarizeAttendance } from './attendance';

const units = [
  { id: 280, number: 'T1-101', coefficient: 0.2 },
  { id: 281, number: 'T1-102', coefficient: 0.2 },
  { id: 282, number: 'T1-201', coefficient: 0.15, residentName: 'Residente 3' },
  { id: 283, number: 'T2-101', coefficient: 0.15 },
  { id: 284, number: 'T2-102', coefficient: 0.15 },
  { id: 285, number: 'T2-201', coefficient: 0.15 },
];
const records = [
  { id: 3, property_unit_id: 283, unit_number: 'T2-101', resident_name: 'Residente 4', attended_as_owner: true },
  { id: 1, property_unit_id: 280, unit_number: 'T1-101', resident_name: 'Residente 1', attended_as_owner: true },
  { id: 2, property_unit_id: 281, unit_number: 'T1-102', resident_name: 'Residente 2', proxy_name: 'Ana Poder', attended_as_proxy: true },
  { id: 4, property_unit_id: 284, unit_number: 'T2-102', resident_name: '', attended_as_owner: false },
];

describe('asistencia', () => {
  const rows = buildAttendanceRows(records, units);

  it('incluye todas las unidades (sin registro = ausente), ordenadas, con coeficiente en % del total', () => {
    expect(rows.map((r) => r.unitNumber)).toEqual(['T1-101', 'T1-102', 'T1-201', 'T2-101', 'T2-102', 'T2-201']);
    expect(rows[0].coefPct).toBeCloseTo(20);
    const sinRegistro = rows.find((r) => r.unitNumber === 'T1-201')!;
    expect([sinRegistro.recordId, sinRegistro.present, sinRegistro.residentName]).toEqual([null, false, 'Residente 3']);
    expect(rows.find((r) => r.unitNumber === 'T2-102')!.residentName).toBe('Sin residente');
  });

  it('resume presentes por coeficiente sobre toda la propiedad', () => {
    const s = summarizeAttendance(rows);
    expect([s.total, s.present, s.absent, s.proxy]).toEqual([6, 3, 3, 1]);
    expect(s.presentCoefPct).toBeCloseTo(55);
  });

  it('filtra por pestaña y por texto', () => {
    expect(filterAttendanceRows(rows, 'absent', '').map((r) => r.unitNumber)).toEqual(['T1-201', 'T2-102', 'T2-201']);
    expect(filterAttendanceRows(rows, 'proxy', '').map((r) => r.unitNumber)).toEqual(['T1-102']);
    expect(filterAttendanceRows(rows, 'all', 't2').length).toBe(3);
    expect(filterAttendanceRows(rows, 'present', 'ana').map((r) => r.unitNumber)).toEqual(['T1-102']);
  });

  it('marcar/desmarcar actualiza el resumen', () => {
    const next = setRowPresence(rows, 284, true);
    expect(summarizeAttendance(next).present).toBe(4);
    expect(summarizeAttendance(setRowPresence(next, 280, false)).presentCoefPct).toBeCloseTo(50);
  });
});

describe('asistencia: nombre completo de la unidad', () => {
  const unitsConTipo = [
    { id: 1, number: '12', block: 'Casa', coefficient: 1 },
    { id: 2, number: '3', block: 'Dúplex', coefficient: 1 },
    { id: 3, number: '1001', block: 'Local', coefficient: 1 },
    { id: 4, number: '50', block: '', coefficient: 1 },
  ];
  const conRegistro = [
    { id: 9, property_unit_id: 1, unit_number: '12', unit_block: 'Casa', resident_name: 'Ana', attended_as_owner: true },
  ];

  it('muestra tipo + número ("Casa 12", "Dúplex 3", "Local 1001") con o sin registro', () => {
    const rows = buildAttendanceRows(conRegistro, unitsConTipo);
    expect(rows.map((r) => r.unitNumber)).toEqual(['50', 'Casa 12', 'Dúplex 3', 'Local 1001']);
  });

  it('se puede buscar por el nombre completo', () => {
    const rows = buildAttendanceRows(conRegistro, unitsConTipo);
    expect(filterAttendanceRows(rows, 'all', 'dúplex').map((r) => r.unitNumber)).toEqual(['Dúplex 3']);
  });
});
