export interface BackendTrainingSession {
  id: number; business_id: number; training_session_type_id: number;
  session_type_name: string; session_type_code: string;
  coach_id: number; coach_name: string;
  training_group_id?: number; group_name?: string;
  session_mode: string; scheduled_date: string; start_time: string; end_time: string;
  duration: number; location?: string; field?: string;
  max_participants?: number; current_participants: number; price?: number;
  status: string; is_recurring: boolean;
  coach_notes?: string; public_notes?: string; cancellation_reason?: string;
  created_at: string; updated_at: string;
}

export interface BackendGetSessionsResponse {
  success: boolean; message: string; data: BackendTrainingSession[];
  total: number; page: number; page_size: number; total_pages: number;
}
export interface BackendGetSessionByIdResponse { success: boolean; message: string; data: BackendTrainingSession; }
export interface BackendCreateSessionResponse { success: boolean; message: string; data: BackendTrainingSession; }
export interface BackendUpdateSessionResponse { success: boolean; message: string; data: BackendTrainingSession; }
export interface BackendCancelSessionResponse { success: boolean; message: string; }
