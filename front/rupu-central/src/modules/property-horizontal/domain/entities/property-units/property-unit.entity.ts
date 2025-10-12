/**
 * Entidad: PropertyUnit
 * Representa una unidad de propiedad dentro de una propiedad horizontal
 */

export interface PropertyUnit {
  id: number;
  businessId: number;
  number: string;
  floor?: number;
  block?: string;
  unitType: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyUnitsPaginated {
  units: PropertyUnit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreatePropertyUnitDTO {
  number: string;
  floor?: number;
  block?: string;
  unitType: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
}

export interface UpdatePropertyUnitDTO {
  number?: string;
  floor?: number;
  block?: string;
  unitType?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  isActive?: boolean;
}

// Tipos de unidad
export const UNIT_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  OFFICE: 'office',
  COMMERCIAL: 'commercial',
  PARKING: 'parking',
  STORAGE: 'storage',
} as const;

export const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  office: 'Oficina',
  commercial: 'Local comercial',
  parking: 'Parqueadero',
  storage: 'Depósito',
};

