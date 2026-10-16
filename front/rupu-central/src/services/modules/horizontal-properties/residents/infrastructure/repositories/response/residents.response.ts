/**
 * Tipos de respuesta del backend para Residents
 */

// Interfaz para el listado (información resumida)
export interface BackendResidentListItem {
  id: number;
  property_unit_number: string;
  property_unit_block?: string;
  dni?: string;
  since?: string;
  resident_type_name: string;
  name: string;
  email: string;
  phone?: string;
  is_main_resident: boolean;
  is_active: boolean;
}

export interface BackendResidentsSummaryResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    active: number;
    inactive: number;
    main: number;
    without_email?: number;
    types: Array<{ resident_type_id: number; name: string; code: string; total: number }>;
  };
}

// Interfaz para el detalle completo
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
    residents: BackendResidentListItem[]; // Cambiado a lista resumida
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


export interface BackendResidentOverviewResponse {
  success: boolean;
  message: string;
  data: {
    stats: { visits_30d: number; packages_pending: number; reservations: number; votes_cast: number; votes_total: number };
    housemates: Array<{ id: number; name: string; type_name: string; is_main: boolean }>;
    activity: Array<{ kind: string; title: string; subtitle: string; at: string }>;
  };
}
