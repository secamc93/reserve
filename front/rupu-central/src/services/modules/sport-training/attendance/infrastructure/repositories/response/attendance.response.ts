export interface BackendAttendanceRecord {
  id: number; training_session_id: number; session_date?: string; session_location?: string;
  player_id: number; player_name: string; attendance_status_id: number;
  status_name: string; status_code: string; status_color: string;
  check_in_time?: string; check_out_time?: string;
  recorded_by_coach_id?: number; recorded_by_coach_name?: string; recorded_at: string;
  performance_rating?: number; coach_feedback?: string; player_notes?: string;
  created_at: string; updated_at: string;
}

export interface BackendGetAttendanceResponse {
  success: boolean; message: string; data: BackendAttendanceRecord[];
  total: number; page: number; page_size: number; total_pages: number;
}

export interface BackendRecordAttendanceResponse {
  success: boolean; message: string; data: BackendAttendanceRecord;
}
