/**
 * Response Types del Backend para Guardians
 */

export interface BackendGuardian {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  secondary_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  relationship?: string;
  photo_url?: string;
  notes?: string;
  can_book_sessions: boolean;
  can_access_records: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendGuardianListItem {
  id: number;
  business_id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  relationship?: string;
  can_book_sessions: boolean;
  can_access_records: boolean;
  is_active: boolean;
  created_at: string;
}

export interface BackendGetGuardiansResponse {
  success: boolean;
  message: string;
  data: BackendGuardianListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendGetGuardianByIdResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}

export interface BackendCreateGuardianResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}

export interface BackendUpdateGuardianResponse {
  success: boolean;
  message: string;
  data: BackendGuardian;
}
