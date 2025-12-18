/**
 * Interfaces para las respuestas del backend de zonas comunes y reservas
 */

export interface BackendCommonArea {
  id: number;
  business_id: number;
  common_area_type_id: number;
  name: string;
  description?: string;
  location?: string;
  max_capacity: number;
  area_sqm?: number;
  has_equipment: boolean;
  equipment_description?: string;
  hourly_rate?: number;
  requires_approval: boolean;
  requires_deposit: boolean;
  deposit_amount?: number;
  allows_recurring: boolean;
  is_active: boolean;
  image_urls?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendCommonAreaList {
  id: number;
  name: string;
  type_name: string;
  location: string;
  max_capacity: number;
  is_active: boolean;
  requires_approval: boolean;
}

export interface BackendCommonAreasPaginatedResponse {
  success: boolean;
  data: BackendCommonAreaList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendCommonAreaResponse {
  success: boolean;
  message: string;
  data: BackendCommonArea;
}

export interface BackendReservation {
  id: number;
  business_id: number;
  common_area_id: number;
  common_area_name?: string;
  property_unit_id: number;
  property_unit_number?: string;
  resident_id?: number;
  resident_name?: string;
  reservation_status_id: number;
  status_name?: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  requires_approval: boolean;
  approved_by_user_id?: number;
  approved_at?: string;
  rejected_by_user_id?: number;
  rejected_at?: string;
  rejection_reason?: string;
  number_of_guests: number;
  purpose?: string;
  special_requests?: string;
  is_recurring: boolean;
  recurring_pattern_id?: number;
  parent_reservation_id?: number;
  total_amount?: number;
  deposit_amount?: number;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  full_payment_paid: boolean;
  full_payment_paid_at?: string;
  qr_code?: string;
  access_code?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  checked_in_by_user_id?: number;
  checked_out_by_user_id?: number;
  notify_resident: boolean;
  notify_admin: boolean;
  notification_sent_at?: string;
  reminder_sent_at?: string;
  cancelled_at?: string;
  cancelled_by_user_id?: number;
  cancellation_reason?: string;
  refund_amount?: number;
  notes?: string;
  resident_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendReservationList {
  id: number;
  common_area_name: string;
  property_unit_number: string;
  resident_name: string;
  status_name: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  created_at: string;
}

export interface BackendReservationsPaginatedResponse {
  success: boolean;
  data: BackendReservationList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendReservationResponse {
  success: boolean;
  message: string;
  data: BackendReservation;
}

export interface BackendCheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  message?: string;
}
