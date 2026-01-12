/**
 * Entidad: CommonArea
 * Representa una zona común en el sistema
 */

export interface CommonArea {
  id: number;
  businessId: number;
  commonAreaTypeId: number;
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

export interface CommonAreaListDTO {
  id: number;
  name: string;
  typeName: string;
  location: string;
  maxCapacity: number;
  isActive: boolean;
  requiresApproval: boolean;
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
