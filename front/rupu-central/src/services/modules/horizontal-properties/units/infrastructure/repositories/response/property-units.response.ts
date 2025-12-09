/**
 * Tipos de respuesta del backend para Property Units
 */

export interface BackendPropertyUnit {
  id: number;
  business_id: number;
  number: string;
  floor?: number;
  block?: string;
  unit_type: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  participation_coefficient?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendGetPropertyUnitsResponse {
  success: boolean;
  message: string;
  data: {
    units: BackendPropertyUnit[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface BackendGetPropertyUnitByIdResponse {
  success: boolean;
  message: string;
  data: BackendPropertyUnit;
}

export interface BackendCreatePropertyUnitResponse {
  success: boolean;
  message: string;
  data: BackendPropertyUnit;
}

export interface BackendUpdatePropertyUnitResponse {
  success: boolean;
  message: string;
  data: BackendPropertyUnit;
}

export interface BackendDeletePropertyUnitResponse {
  success: boolean;
  message: string;
}

