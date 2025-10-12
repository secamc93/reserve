/**
 * Tipos de respuesta del backend para Residents
 */

export interface BackendResident {
  id: number;
  business_id: number;
  property_unit_id: number;
  property_unit_number: string;
  resident_type_id: number;
  resident_type_name: string;
  resident_type_code: string;
  name: string;
  email: string;
  phone?: string;
  dni: string;
  emergency_contact?: string;
  is_main_resident: boolean;
  is_active: boolean;
  move_in_date?: string;
  move_out_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  created_at: string;
  updated_at: string;
}

export interface BackendGetResidentsResponse {
  success: boolean;
  message: string;
  data: {
    residents: BackendResident[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface BackendGetResidentByIdResponse {
  success: boolean;
  message: string;
  data: BackendResident;
}

export interface BackendCreateResidentResponse {
  success: boolean;
  message: string;
  data: BackendResident;
}

export interface BackendUpdateResidentResponse {
  success: boolean;
  message: string;
  data: BackendResident;
}

export interface BackendDeleteResidentResponse {
  success: boolean;
  message: string;
}

