/**
 * Entidad: Resident
 * Representa un residente de una unidad de propiedad
 */

export interface Resident {
  id: number;
  businessId: number;
  propertyUnitId: number;
  propertyUnitNumber: string;
  residentTypeId: number;
  residentTypeName: string;
  residentTypeCode: string;
  name: string;
  email: string;
  phone?: string;
  dni: string;
  emergencyContact?: string;
  isMainResident: boolean;
  isActive: boolean;
  moveInDate?: string;
  moveOutDate?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResidentsPaginated {
  residents: Resident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateResidentDTO {
  propertyUnitId: number;
  residentTypeId: number;
  name: string;
  email: string;
  phone?: string;
  dni: string;
  emergencyContact?: string;
  isMainResident?: boolean;
  moveInDate?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
}

export interface UpdateResidentDTO {
  propertyUnitId?: number;
  residentTypeId?: number;
  name?: string;
  email?: string;
  phone?: string;
  dni?: string;
  emergencyContact?: string;
  isMainResident?: boolean;
  isActive?: boolean;
  moveInDate?: string;
  moveOutDate?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
}

export interface BulkUpdateResidentDTO {
  property_unit_number: string;
  name?: string;
  dni?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  isMainResident?: boolean;
  isActive?: boolean;
}

// Tipos de residente comunes
export const RESIDENT_TYPES = {
  OWNER: 1,
  TENANT: 2,
  FAMILY: 3,
  GUEST: 4,
} as const;

export const RESIDENT_TYPE_LABELS: Record<number, string> = {
  1: 'Propietario',
  2: 'Arrendatario',
  3: 'Familiar',
  4: 'Invitado',
};

