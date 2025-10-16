/**
 * Utilidades de validación para el sistema de votaciones
 * Basado en DOCUMENTACION_API_VOTING_SYSTEM.txt
 */

export class VotingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VotingValidationError';
  }
}

/**
 * Valida que la fecha de fin sea posterior a la fecha de inicio
 * @throws {VotingValidationError} Si las fechas son inválidas
 */
export function validateDateRange(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    throw new VotingValidationError('Fecha de inicio inválida');
  }

  if (isNaN(end.getTime())) {
    throw new VotingValidationError('Fecha de fin inválida');
  }

  if (end <= start) {
    throw new VotingValidationError(
      'La fecha de fin debe ser posterior a la fecha de inicio'
    );
  }
}

/**
 * Valida que si requires_quorum es true, quorum_percentage debe estar definido
 * @throws {VotingValidationError} Si la configuración de quórum es inválida
 */
export function validateQuorumConfiguration(
  requiresQuorum: boolean,
  quorumPercentage?: number
): void {
  if (requiresQuorum && (quorumPercentage === undefined || quorumPercentage === null)) {
    throw new VotingValidationError(
      'Si se requiere quórum, debe especificarse el porcentaje de quórum'
    );
  }

  if (quorumPercentage !== undefined && quorumPercentage !== null) {
    if (quorumPercentage <= 0 || quorumPercentage > 100) {
      throw new VotingValidationError(
        'El porcentaje de quórum debe estar entre 0 y 100'
      );
    }
  }
}

/**
 * Valida el formato ISO 8601 de una fecha
 * @throws {VotingValidationError} Si el formato es inválido
 */
export function validateISO8601Format(dateString: string, fieldName: string): void {
  // Regex para formato ISO 8601: YYYY-MM-DDTHH:MM:SSZ
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (!iso8601Regex.test(dateString)) {
    throw new VotingValidationError(
      `${fieldName} debe estar en formato ISO 8601 (ej: 2025-03-01T08:00:00Z)`
    );
  }
}

/**
 * Valida las longitudes de strings según la API
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): void {
  if (min && value.length < min) {
    throw new VotingValidationError(
      `${fieldName} debe tener al menos ${min} caracteres`
    );
  }

  if (max && value.length > max) {
    throw new VotingValidationError(
      `${fieldName} no puede exceder ${max} caracteres`
    );
  }
}

/**
 * Valida un display_order
 */
export function validateDisplayOrder(order: number): void {
  if (!Number.isInteger(order) || order < 1) {
    throw new VotingValidationError(
      'El orden de visualización debe ser un número entero positivo'
    );
  }
}

/**
 * Valida el porcentaje requerido
 */
export function validateRequiredPercentage(percentage?: number): void {
  if (percentage !== undefined && percentage !== null) {
    if (percentage <= 0 || percentage > 100) {
      throw new VotingValidationError(
        'El porcentaje requerido debe estar entre 0 y 100'
      );
    }
  }
}

/**
 * Valida que una votación esté activa y dentro del periodo de votación
 */
export function validateVotingPeriod(
  votingStartDate: string,
  votingEndDate: string
): { isActive: boolean; message?: string } {
  const now = new Date();
  const start = new Date(votingStartDate);
  const end = new Date(votingEndDate);

  if (now < start) {
    return {
      isActive: false,
      message: `La votación aún no ha comenzado. Inicia el ${start.toLocaleString()}`,
    };
  }

  if (now > end) {
    return {
      isActive: false,
      message: `La votación ha finalizado. Terminó el ${end.toLocaleString()}`,
    };
  }

  return { isActive: true };
}

/**
 * Convierte una fecha local a formato ISO 8601 UTC
 */
export function toISO8601(date: Date): string {
  return date.toISOString();
}

/**
 * Valida todos los campos de un CreateVotingGroupDTO
 */
export function validateCreateVotingGroup(data: {
  name: string;
  votingStartDate: string;
  votingEndDate: string;
  description?: string;
  requiresQuorum?: boolean;
  quorumPercentage?: number;
  notes?: string;
}): void {
  // Validar nombre
  validateStringLength(data.name, 'Nombre', 3, 150);

  // Validar fechas
  validateISO8601Format(data.votingStartDate, 'Fecha de inicio');
  validateISO8601Format(data.votingEndDate, 'Fecha de fin');
  validateDateRange(data.votingStartDate, data.votingEndDate);

  // Validar campos opcionales
  if (data.description) {
    validateStringLength(data.description, 'Descripción', undefined, 1000);
  }

  if (data.notes) {
    validateStringLength(data.notes, 'Notas', undefined, 2000);
  }

  // Validar configuración de quórum
  if (data.requiresQuorum !== undefined) {
    validateQuorumConfiguration(data.requiresQuorum, data.quorumPercentage);
  }
}

/**
 * Valida todos los campos de un UpdateVotingGroupDTO
 * Nota: Todos los campos son opcionales en el update
 */
export function validateUpdateVotingGroup(data: {
  name?: string;
  description?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  requiresQuorum?: boolean;
  quorumPercentage?: number;
  notes?: string;
}): void {
  // Validar nombre si se proporciona
  if (data.name !== undefined) {
    validateStringLength(data.name, 'Nombre', 3, 150);
  }

  // Validar fechas si se proporcionan
  if (data.votingStartDate !== undefined) {
    validateISO8601Format(data.votingStartDate, 'Fecha de inicio');
  }

  if (data.votingEndDate !== undefined) {
    validateISO8601Format(data.votingEndDate, 'Fecha de fin');
  }

  // Validar rango de fechas si ambas se proporcionan
  if (data.votingStartDate !== undefined && data.votingEndDate !== undefined) {
    validateDateRange(data.votingStartDate, data.votingEndDate);
  }

  // Validar campos opcionales
  if (data.description !== undefined && data.description) {
    validateStringLength(data.description, 'Descripción', undefined, 1000);
  }

  if (data.notes !== undefined && data.notes) {
    validateStringLength(data.notes, 'Notas', undefined, 2000);
  }

  // Validar configuración de quórum
  if (data.requiresQuorum !== undefined) {
    validateQuorumConfiguration(data.requiresQuorum, data.quorumPercentage);
  }
}

/**
 * Valida todos los campos de un CreateVotingDTO
 */
export function validateCreateVoting(data: {
  title: string;
  description: string;
  displayOrder: number;
  requiredPercentage?: number;
}): void {
  validateStringLength(data.title, 'Título', 3, 200);
  validateStringLength(data.description, 'Descripción', 1, 2000);
  validateDisplayOrder(data.displayOrder);
  
  if (data.requiredPercentage !== undefined) {
    validateRequiredPercentage(data.requiredPercentage);
  }
}

/**
 * Valida todos los campos de un UpdateVotingDTO
 * Nota: Todos los campos son opcionales en el update
 */
export function validateUpdateVoting(data: {
  title?: string;
  description?: string;
  votingType?: string;
  isSecret?: boolean;
  allowAbstention?: boolean;
  displayOrder?: number;
  requiredPercentage?: number;
}): void {
  // Validar título si se proporciona
  if (data.title !== undefined) {
    validateStringLength(data.title, 'Título', 3, 200);
  }

  // Validar descripción si se proporciona
  if (data.description !== undefined) {
    validateStringLength(data.description, 'Descripción', 1, 2000);
  }

  // Validar tipo de votación si se proporciona
  if (data.votingType !== undefined) {
    const validTypes = ['simple', 'multiple', 'weighted', 'majority'];
    if (!validTypes.includes(data.votingType)) {
      throw new VotingValidationError(
        `Tipo de votación inválido. Debe ser uno de: ${validTypes.join(', ')}`
      );
    }
  }

  // Validar display order si se proporciona
  if (data.displayOrder !== undefined) {
    validateDisplayOrder(data.displayOrder);
  }

  // Validar porcentaje requerido si se proporciona
  if (data.requiredPercentage !== undefined) {
    validateRequiredPercentage(data.requiredPercentage);
  }
}

/**
 * Valida todos los campos de un CreateVotingOptionDTO
 */
export function validateCreateVotingOption(data: {
  optionText: string;
  optionCode: string;
  displayOrder: number;
  color?: string;
}): void {
  validateStringLength(data.optionText, 'Texto de la opción', 1, 100);
  validateStringLength(data.optionCode, 'Código de la opción', 1, 20);
  validateDisplayOrder(data.displayOrder);
  
  // Validar color hexadecimal si se proporciona
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new Error('El color debe ser un código hexadecimal válido (ej: #22c55e)');
  }
}

