/**
 * Response Types del Backend para Guardians
 * Mapeo de snake_case (backend) a camelCase (frontend)
 */

// Backend Guardian (detalle completo)
export interface BackendGuardian {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  phone: string;
  relationship_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Guardian List Item
export interface BackendGuardianListItem {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  phone: string;
  relationship_type: string;
  is_active: boolean;
  created_at: string;
}

// Backend Player Guardian
export interface BackendPlayerGuardian {
  id: number;
  player_id: number;
  guardian_id: number;
  guardian_name?: string;
  guardian_phone?: string;
  is_primary: boolean;
  created_at: string;
}

// Response de lista paginada
export interface BackendGetGuardiansResponse {
  success: boolean;
  message: string;
  data: BackendGuardianListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Response de detalle
export interface BackendGetGuardianByIdResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}

// Response de creación
export interface BackendCreateGuardianResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}

// Response de actualización
export interface BackendUpdateGuardianResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}

// Response de eliminación
export interface BackendDeleteGuardianResponse {
  success: boolean;
  message: string;
}

// Response de asignación
export interface BackendAssignGuardianResponse {
  success: boolean;
  message: string;
}

// Response de apoderados de jugador
export interface BackendGetPlayerGuardiansResponse {
  success: boolean;
  message: string;
  data: BackendPlayerGuardian[];
}
