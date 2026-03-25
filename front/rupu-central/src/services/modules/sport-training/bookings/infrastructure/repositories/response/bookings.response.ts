export interface BackendBookingListItem {
  id: number; training_session_id: number; player_id: number; player_name: string;
  session_date: string; session_mode: string; location: string;
  status_name: string; status_code: string; status_color: string;
  booking_date: string; is_paid: boolean; price?: number; created_at: string;
}

export interface BackendBookingDetail {
  id: number; training_session_id: number; player_id: number; player_name: string;
  booked_by_user_id: number; booking_status_id: number; booking_date: string;
  request_notes?: string; reviewed_at?: string; reviewed_by_coach_id?: number;
  response_notes?: string; cancelled_at?: string; cancelled_by_user_id?: number;
  cancellation_reason?: string; price?: number; is_paid: boolean;
  payment_date?: string; payment_method?: string;
  status_name: string; status_code: string; status_color: string;
  created_at: string; updated_at: string;
}

export interface BackendGetBookingsResponse {
  success: boolean; message: string; data: BackendBookingListItem[];
  total: number; page: number; page_size: number; total_pages: number;
}
export interface BackendGetBookingByIdResponse { success: boolean; message: string; data: BackendBookingDetail; }
export interface BackendCreateBookingResponse { success: boolean; message: string; data: BackendBookingListItem; }
export interface BackendSimpleResponse { success: boolean; message: string; }
