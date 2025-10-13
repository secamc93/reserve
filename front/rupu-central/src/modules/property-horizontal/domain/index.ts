/**
 * Barrel del dominio de Property Horizontal
 */

// Todas las entidades
export * from './entities';

// Todos los puertos (Interfaces de repositorios)
export * from './ports/horizontal-properties.repository';
export * from './ports/voting-groups.repository';
export * from './ports/votings.repository';
export * from './ports/property-units.repository';
export * from './ports/residents.repository';

// Validaciones
export * from './validation';

