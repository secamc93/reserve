/**
 * Entidad: CommonArea
 * Representa una zona común de la propiedad, su horario semanal y sus bloqueos.
 */

/** Horario de un día: 0 = domingo … 6 = sábado. Horas en "HH:MM". */
export interface CommonAreaSchedule {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CommonArea {
  id: number;
  businessId: number;
  commonAreaTypeId: number;
  typeName?: string;
  typeCode?: string;
  name: string;
  description?: string;
  location?: string;
  maxCapacity: number;
  areaSqm?: number;
  hasEquipment: boolean;
  equipmentDescription?: string;
  hourlyRate?: number;
  requiresApproval: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  allowsRecurring: boolean;
  isActive: boolean;
  imageUrls?: string;
  createdAt: string;
  updatedAt: string;
}

/** Zona en el listado (tarjeta): datos, reglas y horario semanal activo. */
export interface CommonAreaListDTO {
  id: number;
  name: string;
  typeName: string;
  typeCode?: string;
  description?: string;
  location: string;
  maxCapacity: number;
  areaSqm?: number;
  hasEquipment: boolean;
  equipmentDescription?: string;
  hourlyRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  allowsRecurring: boolean;
  isActive: boolean;
  requiresApproval: boolean;
  schedules: CommonAreaSchedule[];
}

export interface CreateCommonAreaDTO {
  commonAreaTypeId: number;
  name: string;
  description?: string;
  location?: string;
  maxCapacity: number;
  areaSqm?: number;
  hasEquipment?: boolean;
  equipmentDescription?: string;
  hourlyRate?: number;
  requiresApproval?: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number;
  allowsRecurring?: boolean;
  imageUrls?: string;
}

export interface UpdateCommonAreaDTO extends CreateCommonAreaDTO {
  isActive: boolean;
}

export interface CommonAreasPaginated {
  data: CommonAreaListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CommonAreaType {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  defaultMaxCapacity?: number;
  requiresApproval: boolean;
  allowsRecurring: boolean;
  isActive: boolean;
}

export type RestrictionType = 'maintenance' | 'event' | 'blocked' | 'holiday';

/** Bloqueo temporal de una zona (mantenimiento, evento, festivo…). Fechas "YYYY-MM-DD". */
export interface CommonAreaRestriction {
  id: number;
  commonAreaId: number;
  restrictionType: RestrictionType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface CreateRestrictionDTO {
  restrictionType: RestrictionType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

/** Unidad para elegir en una reserva: number = código ("126"), block = "Casa", "Dúplex"… */
export interface UnitLookup {
  id: number;
  number: string;
  block: string;
}
