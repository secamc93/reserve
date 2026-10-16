/**
 * Formulario de unidad (lógica pura): valores del formulario como texto y conversión al DTO
 * que espera el back.
 */

import type { CreatePropertyUnitDTO, PropertyUnit, UpdatePropertyUnitDTO } from '../domain';
import { UNIT_TYPES } from '../domain';

export interface UnitFormValues {
  number: string;
  block: string;
  unitType: string;
  floor: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  coefficient: string;
  description: string;
  isActive: boolean;
}

export const emptyUnitForm: UnitFormValues = {
  number: '',
  block: '',
  unitType: UNIT_TYPES.APARTMENT,
  floor: '',
  area: '',
  bedrooms: '',
  bathrooms: '',
  coefficient: '',
  description: '',
  isActive: true,
};

const str = (v: number | undefined | null) => (v === undefined || v === null ? '' : String(v));

export function unitToForm(unit: PropertyUnit): UnitFormValues {
  return {
    number: unit.number ?? '',
    block: unit.block ?? '',
    unitType: unit.unitType || UNIT_TYPES.APARTMENT,
    floor: str(unit.floor),
    area: str(unit.area),
    bedrooms: str(unit.bedrooms),
    bathrooms: str(unit.bathrooms),
    coefficient: str(unit.coefficient),
    description: unit.description ?? '',
    isActive: unit.isActive,
  };
}

/** Convierte un texto numérico (acepta coma decimal) a número; vacío → undefined. */
export function parseOptionalNumber(value: string): number | undefined {
  const v = value.trim().replace(',', '.');
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Errores de validación por campo (vacío si el formulario es válido). */
export function validateUnitForm(values: UnitFormValues): Partial<Record<keyof UnitFormValues, string>> {
  const errors: Partial<Record<keyof UnitFormValues, string>> = {};
  if (!values.number.trim()) errors.number = 'El número es obligatorio';
  if (values.block.trim().length > 10) errors.block = 'Máximo 10 caracteres';
  const numeric: Array<keyof UnitFormValues> = ['floor', 'area', 'bedrooms', 'bathrooms', 'coefficient'];
  for (const key of numeric) {
    const raw = String(values[key]).trim();
    if (raw === '') continue;
    const n = parseOptionalNumber(raw);
    if (n === undefined) errors[key] = 'Debe ser un número';
    else if (n < 0 && key !== 'floor') errors[key] = 'No puede ser negativo';
  }
  return errors;
}

export function formToCreateDTO(values: UnitFormValues): CreatePropertyUnitDTO {
  return {
    number: values.number.trim(),
    block: values.block.trim() || undefined,
    unitType: values.unitType,
    floor: parseOptionalNumber(values.floor),
    area: parseOptionalNumber(values.area),
    bedrooms: parseOptionalNumber(values.bedrooms),
    bathrooms: parseOptionalNumber(values.bathrooms),
    coefficient: parseOptionalNumber(values.coefficient),
    description: values.description.trim() || undefined,
  };
}

export function formToUpdateDTO(values: UnitFormValues): UpdatePropertyUnitDTO {
  return {
    ...formToCreateDTO(values),
    // En edición el bloque y la descripción se pueden vaciar.
    block: values.block.trim(),
    description: values.description.trim(),
    isActive: values.isActive,
  };
}
