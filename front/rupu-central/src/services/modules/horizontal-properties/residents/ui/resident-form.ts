/**
 * Formulario de residente (lógica pura): valores como texto, validación y conversión a los
 * DTO del back (las fechas viajan como RFC 3339).
 */

import type { CreateResidentDTO, Resident, UpdateResidentDTO } from '../domain';

export interface ResidentFormValues {
  propertyUnitId: number;
  /** Etiqueta visible de la unidad elegida ("Casa 126"). */
  unitLabel: string;
  residentTypeId: number;
  name: string;
  email: string;
  dni: string;
  phone: string;
  emergencyContact: string;
  isMainResident: boolean;
  isActive: boolean;
  moveInDate: string;
  moveOutDate: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
}

export function emptyResidentForm(defaultTypeId: number): ResidentFormValues {
  return {
    propertyUnitId: 0,
    unitLabel: '',
    residentTypeId: defaultTypeId,
    name: '',
    email: '',
    dni: '',
    phone: '',
    emergencyContact: '',
    isMainResident: false,
    isActive: true,
    moveInDate: '',
    moveOutDate: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: '',
  };
}

/** "2024-01-15T00:00:00Z" → "2024-01-15" (valor de un <input type="date">). */
export function isoToDateInput(value: string | undefined | null): string {
  if (!value) return '';
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (!m || m[1].startsWith('0001')) return '';
  return m[1];
}

/** "2024-01-15" → "2024-01-15T00:00:00Z"; vacío → undefined. */
export function dateInputToIso(value: string): string | undefined {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : undefined;
}

export function residentToForm(resident: Resident, unitLabel: string): ResidentFormValues {
  return {
    propertyUnitId: resident.propertyUnitId,
    unitLabel,
    residentTypeId: resident.residentTypeId,
    name: resident.name ?? '',
    email: resident.email ?? '',
    dni: resident.dni ?? '',
    phone: resident.phone ?? '',
    emergencyContact: resident.emergencyContact ?? '',
    isMainResident: resident.isMainResident,
    isActive: resident.isActive,
    moveInDate: isoToDateInput(resident.moveInDate),
    moveOutDate: isoToDateInput(resident.moveOutDate),
    leaseStartDate: isoToDateInput(resident.leaseStartDate),
    leaseEndDate: isoToDateInput(resident.leaseEndDate),
    monthlyRent: resident.monthlyRent !== undefined && resident.monthlyRent !== null ? String(resident.monthlyRent) : '',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ResidentFormErrors = Partial<Record<keyof ResidentFormValues, string>>;

/** Validación del formulario. En creación el back exige unidad, tipo, nombre, email y documento. */
export function validateResidentForm(values: ResidentFormValues, mode: 'create' | 'edit'): ResidentFormErrors {
  const errors: ResidentFormErrors = {};
  if (!values.propertyUnitId) errors.unitLabel = 'Elige una unidad de la lista';
  if (!values.residentTypeId) errors.residentTypeId = 'Elige el tipo';
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio';
  const email = values.email.trim();
  if (mode === 'create' && !email) errors.email = 'El email es obligatorio';
  else if (email && !EMAIL_RE.test(email)) errors.email = 'Email no válido';
  if (mode === 'create' && !values.dni.trim()) errors.dni = 'El documento es obligatorio';
  if (values.monthlyRent.trim()) {
    const n = Number(values.monthlyRent.replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) errors.monthlyRent = 'Valor no válido';
  }
  if (values.leaseStartDate && values.leaseEndDate && values.leaseEndDate < values.leaseStartDate) {
    errors.leaseEndDate = 'El fin debe ser posterior al inicio';
  }
  return errors;
}

function parseRent(value: string): number | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const n = Number(v.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function formToCreateResidentDTO(values: ResidentFormValues): CreateResidentDTO {
  return {
    propertyUnitId: values.propertyUnitId,
    residentTypeId: values.residentTypeId,
    name: values.name.trim(),
    email: values.email.trim(),
    dni: values.dni.trim(),
    phone: values.phone.trim() || undefined,
    emergencyContact: values.emergencyContact.trim() || undefined,
    isMainResident: values.isMainResident,
    moveInDate: dateInputToIso(values.moveInDate),
    leaseStartDate: dateInputToIso(values.leaseStartDate),
    leaseEndDate: dateInputToIso(values.leaseEndDate),
    monthlyRent: parseRent(values.monthlyRent),
  };
}

export function formToUpdateResidentDTO(values: ResidentFormValues): UpdateResidentDTO {
  return {
    propertyUnitId: values.propertyUnitId || undefined,
    residentTypeId: values.residentTypeId || undefined,
    name: values.name.trim(),
    email: values.email.trim(),
    dni: values.dni.trim(),
    phone: values.phone.trim(),
    emergencyContact: values.emergencyContact.trim(),
    isMainResident: values.isMainResident,
    isActive: values.isActive,
    moveInDate: dateInputToIso(values.moveInDate),
    moveOutDate: dateInputToIso(values.moveOutDate),
    leaseStartDate: dateInputToIso(values.leaseStartDate),
    leaseEndDate: dateInputToIso(values.leaseEndDate),
    monthlyRent: parseRent(values.monthlyRent),
  };
}
