/**
 * Barrel principal del módulo Property Horizontal
 */

// Exportar tipos del dominio
export type { Unit, CreateUnitDTO } from './domain/entities/horizontal-properties/unit.entity';
export type { Fee, CreateFeeDTO } from './domain/entities/horizontal-properties/fee.entity';
export { UnitStatus, FeeStatus } from './domain';

// Exportar componentes UI
export * from './ui';

// NO exportar actions aquí - importarlas directamente:
// import { getDashboardStatsAction } from '@modules/property-horizontal/infrastructure/actions';

