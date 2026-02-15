package response

import "time"

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SuccessResponse - Respuesta genérica de éxito
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// SessionResponse - Respuesta de sesión
type SessionResponse struct {
	Success bool        `json:"success"`
	Data    SessionData `json:"data"`
}

// SessionData - Datos completos de la sesión
type SessionData struct {
	ID                    uint       `json:"id"`
	BusinessID            uint       `json:"business_id"`
	TrainingSessionTypeID uint       `json:"training_session_type_id"`
	SessionTypeName       string     `json:"session_type_name,omitempty"`
	SessionTypeCode       string     `json:"session_type_code,omitempty"`
	CoachID               uint       `json:"coach_id"`
	CoachName             string     `json:"coach_name,omitempty"`
	TrainingGroupID       *uint      `json:"training_group_id"`
	GroupName             string     `json:"group_name,omitempty"`
	SessionMode           string     `json:"session_mode"`
	ScheduledDate         time.Time  `json:"scheduled_date"`
	StartTime             time.Time  `json:"start_time"`
	EndTime               time.Time  `json:"end_time"`
	Duration              int        `json:"duration"`
	Location              string     `json:"location"`
	Field                 string     `json:"field"`
	MaxParticipants       *int       `json:"max_participants"`
	CurrentParticipants   int        `json:"current_participants"`
	Price                 *float64   `json:"price"`
	Status                string     `json:"status"`
	IsRecurring           bool       `json:"is_recurring"`
	CoachNotes            string     `json:"coach_notes"`
	PublicNotes           string     `json:"public_notes"`
	CancellationReason    string     `json:"cancellation_reason,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

// SessionListData - Datos de sesión para lista
type SessionListData struct {
	ID                  uint      `json:"id"`
	SessionTypeName     string    `json:"session_type_name"`
	SessionTypeCode     string    `json:"session_type_code"`
	CoachName           string    `json:"coach_name"`
	GroupName           string    `json:"group_name"`
	SessionMode         string    `json:"session_mode"`
	ScheduledDate       time.Time `json:"scheduled_date"`
	StartTime           time.Time `json:"start_time"`
	EndTime             time.Time `json:"end_time"`
	Duration            int       `json:"duration"`
	Location            string    `json:"location"`
	Field               string    `json:"field"`
	MaxParticipants     *int      `json:"max_participants"`
	CurrentParticipants int       `json:"current_participants"`
	Price               *float64  `json:"price"`
	Status              string    `json:"status"`
	IsRecurring         bool      `json:"is_recurring"`
	CreatedAt           time.Time `json:"created_at"`
}

// PaginatedSessionsResponse - Respuesta paginada de sesiones
type PaginatedSessionsResponse struct {
	Success    bool              `json:"success"`
	Data       []SessionListData `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}
