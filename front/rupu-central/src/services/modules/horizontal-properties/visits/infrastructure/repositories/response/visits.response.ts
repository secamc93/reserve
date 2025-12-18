/**
 * Interfaces de respuesta del backend para Visitas
 */

export interface BackendVisitor {
  id: number;
  business_id?: number;
  dni: string;
  full_name: string;
  phone: string;
  email?: string;
  photo_url?: string;
  has_blacklist: boolean;
  is_verified: boolean;
  last_visit_at?: string;
  total_visits: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendVisitorResponse {
  success: boolean;
  data: BackendVisitor;
}

export interface BackendVisit {
  id: number;
  business_id: number;
  visitor_id: number;
  property_unit_id: number;
  resident_id?: number;
  visit_type_id: number;
  visit_status_id: number;
  visitor_vehicle_id?: number;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  actual_entry_time?: string;
  actual_exit_time?: string;
  duration_minutes?: number;
  authorization_code: string;
  qr_code: string;
  qr_code_expires_at?: string;
  authorized_by_resident_id?: number;
  authorization_date?: string;
  authorization_expires_at?: string;
  registered_by_user_id?: number;
  entry_registered_by_user_id?: number;
  exit_registered_by_user_id?: number;
  entry_gate?: string;
  exit_gate?: string;
  entry_method?: string;
  purpose?: string;
  number_of_visitors: number;
  has_companions: boolean;
  has_assets: boolean;
  notes?: string;
  is_recurring: boolean;
  recurring_pattern_id?: number;
  parent_visit_id?: number;
  duration_exceeded: boolean;
  duration_exceeded_at?: string;
  alert_sent: boolean;
  notify_resident: boolean;
  notify_security: boolean;
  notification_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendVisitList {
  id: number;
  visitor_name: string;
  visitor_dni: string;
  property_unit_number: string;
  visit_type_name: string;
  visit_status_name: string;
  scheduled_date: string;
  actual_entry_time?: string;
  actual_exit_time?: string;
  created_at: string;
}

export interface BackendVisitResponse {
  success: boolean;
  data: BackendVisit;
}

export interface BackendVisitsPaginatedResponse {
  success: boolean;
  data: BackendVisitList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
