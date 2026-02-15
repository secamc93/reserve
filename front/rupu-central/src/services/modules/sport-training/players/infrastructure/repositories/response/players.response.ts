/**
 * Response Types del Backend para Players
 * Mapeo de snake_case (backend) a camelCase (frontend)
 */

// Backend Player (detalle completo)
export interface BackendPlayer {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  birth_date: string;
  skill_level_id: number;
  skill_level_name: string;
  email?: string;
  phone?: string;
  emergency_contact?: string;
  medical_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Backend Player List Item (puede ser resumido)
export interface BackendPlayerListItem {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_number: string;
  birth_date: string;
  skill_level_id: number;
  skill_level_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

// Response de lista paginada
export interface BackendGetPlayersResponse {
  success: boolean;
  message: string;
  data: BackendPlayerListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Response de detalle
export interface BackendGetPlayerByIdResponse {
  success: boolean;
  message: string;
  data: BackendPlayer;
}

// Response de creación
export interface BackendCreatePlayerResponse {
  success: boolean;
  message: string;
  data: BackendPlayer;
}

// Response de actualización
export interface BackendUpdatePlayerResponse {
  success: boolean;
  message: string;
  data: BackendPlayer;
}

// Response de eliminación
export interface BackendDeletePlayerResponse {
  success: boolean;
  message: string;
}
