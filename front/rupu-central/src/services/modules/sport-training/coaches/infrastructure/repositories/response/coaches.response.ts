/**
 * Response Types del Backend para Coaches
 * Mapeo de snake_case (backend) a camelCase (frontend)
 */

// Backend Coach Specialty Assignment
export interface BackendCoachSpecialtyAssignment {
  id: number;
  coach_id: number;
  specialty_id: number;
  specialty_name: string;
  specialty_code: string;
  years_experience: number;
  created_at: string;
}

// Backend Coach (detalle completo)
export interface BackendCoach {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  phone: string;
  specialties: BackendCoachSpecialtyAssignment[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Coach List Item
export interface BackendCoachListItem {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  phone: string;
  specialties: BackendCoachSpecialtyAssignment[];
  is_active: boolean;
  created_at: string;
}

// Response de lista paginada
export interface BackendGetCoachesResponse {
  success: boolean;
  message: string;
  data: BackendCoachListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Response de detalle
export interface BackendGetCoachByIdResponse {
  success: boolean;
  message: string;
  data: BackendCoach;
}

// Response de creación
export interface BackendCreateCoachResponse {
  success: boolean;
  message: string;
  data: BackendCoach;
}

// Response de actualización
export interface BackendUpdateCoachResponse {
  success: boolean;
  message: string;
  data: BackendCoach;
}

// Response de eliminación
export interface BackendDeleteCoachResponse {
  success: boolean;
  message: string;
}

// Response de asignación de especialidad
export interface BackendAssignSpecialtyResponse {
  success: boolean;
  message: string;
}
