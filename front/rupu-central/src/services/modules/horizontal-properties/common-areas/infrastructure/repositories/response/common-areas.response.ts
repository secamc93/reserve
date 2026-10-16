/**
 * Respuestas del backend de zonas comunes y reservas (snake_case; los opcionales llegan
 * como null).
 */

type N<T> = T | null | undefined;

export interface BackendSchedule {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface BackendCommonArea {
  id: number;
  business_id: number;
  common_area_type_id: number;
  type_name?: string;
  type_code?: string;
  name: string;
  description?: string;
  location?: string;
  max_capacity: number;
  area_sqm?: N<number>;
  has_equipment: boolean;
  equipment_description?: string;
  hourly_rate?: N<number>;
  requires_approval: boolean;
  requires_deposit: boolean;
  deposit_amount?: N<number>;
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
  type_code?: string;
  description?: string;
  location: string;
  max_capacity: number;
  area_sqm?: N<number>;
  has_equipment?: boolean;
  equipment_description?: string;
  hourly_rate?: N<number>;
  requires_deposit?: boolean;
  deposit_amount?: N<number>;
  allows_recurring?: boolean;
  is_active: boolean;
  requires_approval: boolean;
  schedules?: N<BackendSchedule[]>;
}

export interface BackendCommonAreasPaginatedResponse {
  success: boolean;
  data: BackendCommonAreaList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendRestriction {
  id: number;
  common_area_id: number;
  restriction_type: string;
  start_date: string;
  end_date: string;
  start_time?: N<string>;
  end_time?: N<string>;
  reason?: string;
}

export interface BackendUnitLookup {
  id: number;
  number: string;
  block: string;
}

export interface BackendReservation {
  id: number;
  business_id: number;
  common_area_id: number;
  common_area_name?: string;
  property_unit_id: number;
  property_unit_number?: string;
  property_unit_block?: string;
  resident_id?: N<number>;
  resident_name?: string;
  reservation_status_id: number;
  status_code?: string;
  status_name?: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  requires_approval: boolean;
  approved_at?: N<string>;
  rejected_at?: N<string>;
  rejection_reason?: string;
  number_of_guests: number;
  purpose?: string;
  special_requests?: string;
  is_recurring: boolean;
  total_amount?: N<number>;
  deposit_amount?: N<number>;
  deposit_paid: boolean;
  deposit_paid_at?: N<string>;
  full_payment_paid: boolean;
  full_payment_paid_at?: N<string>;
  qr_code?: string;
  access_code?: string;
  checked_in_at?: N<string>;
  checked_out_at?: N<string>;
  cancelled_at?: N<string>;
  cancellation_reason?: string;
  notes?: string;
  resident_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface BackendReservationList {
  id: number;
  common_area_id?: number;
  common_area_name: string;
  property_unit_id?: number;
  property_unit_number: string;
  property_unit_block?: string;
  resident_name: string;
  status_code?: string;
  status_name: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  purpose?: string;
  requires_approval?: boolean;
  total_amount?: N<number>;
  deposit_amount?: N<number>;
  deposit_paid?: boolean;
  full_payment_paid?: boolean;
  checked_in_at?: N<string>;
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

export interface BackendCheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  message?: string;
}

export interface BackendCommonAreaType {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  default_max_capacity?: N<number>;
  requires_approval: boolean;
  allows_recurring: boolean;
  is_active: boolean;
}
