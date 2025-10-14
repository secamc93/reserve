/**
 * Validaciones para Property Units
 * Basado en API_DOCUMENTATION.txt de Property Units
 */

import { UNIT_TYPES } from '../entities/property-units/property-unit.entity';

export class PropertyUnitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PropertyUnitValidationError';
  }
}

/**
 * Valores permitidos para unit_type según la API
 */
const ALLOWED_UNIT_TYPES = Object.values(UNIT_TYPES);

/**
 * Valida que el número de unidad no esté vacío
 * Regla API: El número es REQUERIDO y no puede estar vacío
 */
export function validateUnitNumber(number: string): void {
  if (!number || number.trim() === '') {
    throw new PropertyUnitValidationError('El número de unidad es requerido');
  }

  if (number.trim().length < 1) {
    throw new PropertyUnitValidationError('El número de unidad no puede estar vacío');
  }
}

/**
 * Valida que el tipo de unidad sea uno de los valores permitidos
 * Regla API: Debe ser uno de: apartment, house, office, commercial, parking, storage, penthouse
 */
export function validateUnitType(unitType: string): void {
  if (!unitType || unitType.trim() === '') {
    throw new PropertyUnitValidationError('El tipo de unidad es requerido');
  }

  if (!ALLOWED_UNIT_TYPES.includes(unitType as typeof ALLOWED_UNIT_TYPES[number])) {
    throw new PropertyUnitValidationError(
      `Tipo de unidad inválido. Valores permitidos: ${ALLOWED_UNIT_TYPES.join(', ')}`
    );
  }
}

/**
 * Valida que un campo numérico sea válido (si está presente)
 * Regla API: Los campos numéricos pueden ser null o un número positivo
 */
export function validateNumericField(
  value: number | undefined,
  fieldName: string,
  allowDecimals = false
): void {
  if (value === undefined || value === null) {
    return; // Campo opcional
  }

  if (typeof value !== 'number' || isNaN(value)) {
    throw new PropertyUnitValidationError(`${fieldName} debe ser un número válido`);
  }

  if (value < 0) {
    throw new PropertyUnitValidationError(`${fieldName} no puede ser negativo`);
  }

  if (!allowDecimals && !Number.isInteger(value)) {
    throw new PropertyUnitValidationError(`${fieldName} debe ser un número entero`);
  }
}

/**
 * Valida el campo floor
 */
export function validateFloor(floor?: number): void {
  validateNumericField(floor, 'Piso', false);
}

/**
 * Valida el campo area
 */
export function validateArea(area?: number): void {
  validateNumericField(area, 'Área', true);
  
  if (area !== undefined && area !== null && area === 0) {
    throw new PropertyUnitValidationError('El área debe ser mayor a 0');
  }
}

/**
 * Valida el campo bedrooms
 */
export function validateBedrooms(bedrooms?: number): void {
  validateNumericField(bedrooms, 'Habitaciones', false);
}

/**
 * Valida el campo bathrooms
 */
export function validateBathrooms(bathrooms?: number): void {
  validateNumericField(bathrooms, 'Baños', false);
}

/**
 * Valida el campo block
 */
export function validateBlock(block?: string): void {
  if (block !== undefined && block !== null) {
    if (typeof block !== 'string') {
      throw new PropertyUnitValidationError('El bloque debe ser texto');
    }
    
    if (block.trim().length === 0) {
      throw new PropertyUnitValidationError('El bloque no puede estar vacío');
    }
  }
}

/**
 * Valida el campo description
 */
export function validateDescription(description?: string): void {
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new PropertyUnitValidationError('La descripción debe ser texto');
    }
    
    // Validación de longitud razonable (aunque la API no especifica límite)
    if (description.length > 2000) {
      throw new PropertyUnitValidationError('La descripción no puede exceder 2000 caracteres');
    }
  }
}

/**
 * Valida todos los campos de CreatePropertyUnitDTO
 */
export function validateCreatePropertyUnit(data: {
  number: string;
  unitType: string;
  floor?: number;
  block?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
}): void {
  // Campos requeridos
  validateUnitNumber(data.number);
  validateUnitType(data.unitType);

  // Campos opcionales
  validateFloor(data.floor);
  validateBlock(data.block);
  validateArea(data.area);
  validateBedrooms(data.bedrooms);
  validateBathrooms(data.bathrooms);
  validateDescription(data.description);
}

/**
 * Valida todos los campos de UpdatePropertyUnitDTO
 * Nota: Todos los campos son opcionales en el update
 */
export function validateUpdatePropertyUnit(data: {
  number?: string;
  unitType?: string;
  floor?: number;
  block?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  isActive?: boolean;
}): void {
  // Validar solo los campos presentes
  if (data.number !== undefined) {
    validateUnitNumber(data.number);
  }

  if (data.unitType !== undefined) {
    validateUnitType(data.unitType);
  }

  if (data.floor !== undefined) {
    validateFloor(data.floor);
  }

  if (data.block !== undefined) {
    validateBlock(data.block);
  }

  if (data.area !== undefined) {
    validateArea(data.area);
  }

  if (data.bedrooms !== undefined) {
    validateBedrooms(data.bedrooms);
  }

  if (data.bathrooms !== undefined) {
    validateBathrooms(data.bathrooms);
  }

  if (data.description !== undefined) {
    validateDescription(data.description);
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    throw new PropertyUnitValidationError('El estado activo debe ser true o false');
  }
}

/**
 * Valida los parámetros de paginación
 */
export function validatePaginationParams(page?: number, pageSize?: number): void {
  if (page !== undefined) {
    if (!Number.isInteger(page) || page < 1) {
      throw new PropertyUnitValidationError('El número de página debe ser un entero mayor a 0');
    }
  }

  if (pageSize !== undefined) {
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new PropertyUnitValidationError('El tamaño de página debe estar entre 1 y 100');
    }
  }
}

/**
 * Valida los parámetros de filtro
 */
export function validateFilterParams(filters: {
  unitType?: string;
  floor?: number;
  block?: string;
  isActive?: boolean;
}): void {
  if (filters.unitType !== undefined) {
    validateUnitType(filters.unitType);
  }

  if (filters.floor !== undefined) {
    validateFloor(filters.floor);
  }

  if (filters.block !== undefined) {
    validateBlock(filters.block);
  }

  if (filters.isActive !== undefined && typeof filters.isActive !== 'boolean') {
    throw new PropertyUnitValidationError('El filtro de estado activo debe ser true o false');
  }
}

