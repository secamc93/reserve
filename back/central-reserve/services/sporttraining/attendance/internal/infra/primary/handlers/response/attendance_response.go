package response

import "time"

// ErrorResponse - Response de error estándar
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// AttendanceResponse - Response para registro de asistencia individual
type AttendanceResponse struct {
	Success bool             `json:"success"`
	Data    AttendanceData   `json:"data"`
}

// AttendanceData - Datos de registro de asistencia
type AttendanceData struct {
	ID                  uint       `json:"id"`
	TrainingSessionID   uint       `json:"training_session_id"`
	PlayerID            uint       `json:"player_id"`
	PlayerName          string     `json:"player_name"`
	AttendanceStatusID  uint       `json:"attendance_status_id"`
	StatusName          string     `json:"status_name"`
	StatusCode          string     `json:"status_code"`
	StatusColor         string     `json:"status_color"`
	CheckInTime         *time.Time `json:"check_in_time"`
	CheckOutTime        *time.Time `json:"check_out_time"`
	RecordedByCoachID   uint       `json:"recorded_by_coach_id"`
	RecordedByCoachName string     `json:"recorded_by_coach_name"`
	RecordedAt          time.Time  `json:"recorded_at"`
	PerformanceRating   *int       `json:"performance_rating"`
	CoachFeedback       string     `json:"coach_feedback"`
	PlayerNotes         string     `json:"player_notes"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// PaginatedAttendanceResponse - Response paginado de registros de asistencia
type PaginatedAttendanceResponse struct {
	Success    bool                   `json:"success"`
	Data       []AttendanceListData   `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

// AttendanceListData - Datos para lista de asistencia
type AttendanceListData struct {
	ID                  uint       `json:"id"`
	TrainingSessionID   uint       `json:"training_session_id"`
	SessionDate         time.Time  `json:"session_date"`
	SessionLocation     string     `json:"session_location"`
	PlayerID            uint       `json:"player_id"`
	PlayerName          string     `json:"player_name"`
	AttendanceStatusID  uint       `json:"attendance_status_id"`
	StatusName          string     `json:"status_name"`
	StatusCode          string     `json:"status_code"`
	StatusColor         string     `json:"status_color"`
	CheckInTime         *time.Time `json:"check_in_time"`
	CheckOutTime        *time.Time `json:"check_out_time"`
	PerformanceRating   *int       `json:"performance_rating"`
	RecordedByCoachID   uint       `json:"recorded_by_coach_id"`
	RecordedByCoachName string     `json:"recorded_by_coach_name"`
	RecordedAt          time.Time  `json:"recorded_at"`
	CreatedAt           time.Time  `json:"created_at"`
}
