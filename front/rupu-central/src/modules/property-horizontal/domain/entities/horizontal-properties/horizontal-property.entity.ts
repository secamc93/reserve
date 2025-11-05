/**
 * Entidad de dominio: Propiedad Horizontal
 */

export interface HorizontalProperty {
  id: number;
  name: string;
  code: string;
  businessTypeName: string;
  businessTypeId?: number;
  address: string;
  totalUnits: number;
  isActive: boolean;
  createdAt: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  navbarImageUrl?: string;
  customDomain?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSocialArea?: boolean;
  totalFloors?: number;
  timezone?: string;
  updatedAt?: string;
  propertyUnits?: unknown[];
  committees?: unknown[];
}

export interface HorizontalPropertiesPaginated {
  data: HorizontalProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateHorizontalPropertyDTO {
  // Solo campos requeridos
  name: string;
  address: string;
}

