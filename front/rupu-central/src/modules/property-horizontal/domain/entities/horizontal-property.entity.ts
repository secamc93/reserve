/**
 * Entidad de dominio: Propiedad Horizontal
 */

export interface HorizontalProperty {
  id: number;
  name: string;
  code: string;
  businessTypeName: string;
  address: string;
  totalUnits: number;
  isActive: boolean;
  createdAt: string;
}

export interface HorizontalPropertiesPaginated {
  data: HorizontalProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

