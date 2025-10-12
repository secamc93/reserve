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
  propertyUnits?: any[];
  committees?: any[];
}

export interface HorizontalPropertiesPaginated {
  data: HorizontalProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateHorizontalPropertyDTO {
  // Campos requeridos
  name: string;
  code: string;
  address: string;
  timezone: string;
  totalUnits: number;
  
  // Campos opcionales - información básica
  description?: string;
  totalFloors?: number;
  
  // Amenidades
  hasElevator?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSocialArea?: boolean;
  
  // Archivos
  logoFile?: File;
  navbarImageFile?: File;
  
  // Personalización
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  customDomain?: string;
  
  // Creación automática de unidades
  createUnits?: boolean;
  unitPrefix?: string;
  unitType?: 'apartment' | 'house' | 'office';
  unitsPerFloor?: number;
  startUnitNumber?: number;
  
  // Comités
  createRequiredCommittees?: boolean;
}

