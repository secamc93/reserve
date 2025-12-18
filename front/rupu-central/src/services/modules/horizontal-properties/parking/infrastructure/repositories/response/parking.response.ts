/**
 * Interfaces para las respuestas del backend de parqueaderos
 */

export interface BackendParkingZone {
  id: number;
  business_id: number;
  name: string;
  code: string;
  description?: string;
  location?: string;
  total_slots: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendParkingZoneList {
  id: number;
  name: string;
  code: string;
  location: string;
  total_slots: number;
  is_active: boolean;
}

export interface BackendParkingZonesPaginatedResponse {
  success: boolean;
  data: BackendParkingZoneList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendParkingZoneResponse {
  success: boolean;
  message: string;
  data: BackendParkingZone;
}

export interface BackendParkingSlot {
  id: number;
  parking_zone_id: number;
  parking_type_id: number;
  slot_number: string;
  is_covered: boolean;
  width?: number;
  length?: number;
  height?: number;
  has_charger: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendParkingSlotList {
  id: number;
  parking_zone_id: number;
  parking_zone_name: string;
  parking_type_id: number;
  parking_type_name: string;
  slot_number: string;
  is_covered: boolean;
  has_charger: boolean;
  is_active: boolean;
  is_available: boolean;
  is_assigned: boolean;
  is_occupied: boolean;
}

export interface BackendParkingSlotsPaginatedResponse {
  success: boolean;
  data: BackendParkingSlotList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendParkingSlotResponse {
  success: boolean;
  message: string;
  data: BackendParkingSlot;
}

export interface BackendParkingAssignment {
  id: number;
  business_id: number;
  parking_slot_id: number;
  property_unit_id?: number;
  resident_id?: number;
  vehicle_plate: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendParkingAssignmentList {
  id: number;
  parking_slot_id: number;
  parking_slot_number: string;
  property_unit_id?: number;
  property_unit_number: string;
  resident_id?: number;
  resident_name: string;
  vehicle_plate: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface BackendParkingAssignmentsPaginatedResponse {
  success: boolean;
  data: BackendParkingAssignmentList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendParkingAssignmentResponse {
  success: boolean;
  message: string;
  data: BackendParkingAssignment;
}

export interface BackendParkingReservation {
  id: number;
  business_id: number;
  parking_slot_id: number;
  property_unit_id?: number;
  resident_id?: number;
  visitor_id?: number;
  visitor_vehicle_id?: number;
  reservation_status_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  vehicle_plate: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  qr_code?: string;
  access_code?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  requires_approval: boolean;
  notes?: string;
  resident_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendParkingReservationList {
  id: number;
  parking_slot_id: number;
  parking_slot_number: string;
  property_unit_id?: number;
  property_unit_number: string;
  resident_id?: number;
  resident_name: string;
  visitor_id?: number;
  visitor_name: string;
  status_name: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  vehicle_plate: string;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
}

export interface BackendParkingReservationsPaginatedResponse {
  success: boolean;
  data: BackendParkingReservationList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendParkingReservationResponse {
  success: boolean;
  message: string;
  data: BackendParkingReservation;
}

export interface BackendCheckParkingAvailabilityResponse {
  success: boolean;
  available: boolean;
  message?: string;
}
