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

// CoachResponse - Respuesta de entrenador
type CoachResponse struct {
	Success bool      `json:"success"`
	Data    CoachData `json:"data"`
}

// CoachData - Datos completos del entrenador
type CoachData struct {
	ID                 uint                      `json:"id"`
	BusinessID         uint                      `json:"business_id"`
	UserID             uint                      `json:"user_id"`
	FirstName          string                    `json:"first_name"`
	LastName           string                    `json:"last_name"`
	DocumentType       string                    `json:"document_type"`
	DocumentNumber     string                    `json:"document_number"`
	Email              string                    `json:"email"`
	Phone              string                    `json:"phone"`
	LicenseNumber      *string                   `json:"license_number"`
	YearsOfExperience  *int                      `json:"years_of_experience"`
	Biography          string                    `json:"biography"`
	Certifications     string                    `json:"certifications"`
	IsAvailable        bool                      `json:"is_available"`
	MaxSessionsPerDay  *int                      `json:"max_sessions_per_day"`
	MaxSessionsPerWeek *int                      `json:"max_sessions_per_week"`
	HourlyRate         *float64                  `json:"hourly_rate"`
	PhotoURL           string                    `json:"photo_url"`
	Notes              string                    `json:"notes"`
	IsActive           bool                      `json:"is_active"`
	Specialties        []SpecialtyAssignmentData `json:"specialties,omitempty"`
	CreatedAt          time.Time                 `json:"created_at"`
	UpdatedAt          time.Time                 `json:"updated_at"`
}

// SpecialtyAssignmentData - Datos de asignación de especialidad
type SpecialtyAssignmentData struct {
	ID               uint      `json:"id"`
	SpecialtyID      uint      `json:"specialty_id"`
	SpecialtyName    string    `json:"specialty_name"`
	SpecialtyCode    string    `json:"specialty_code"`
	ProficiencyLevel int       `json:"proficiency_level"`
	CreatedAt        time.Time `json:"created_at"`
}

// CoachListData - Datos de entrenador para lista
type CoachListData struct {
	ID                uint      `json:"id"`
	FirstName         string    `json:"first_name"`
	LastName          string    `json:"last_name"`
	DocumentNumber    string    `json:"document_number"`
	Email             string    `json:"email"`
	Phone             string    `json:"phone"`
	YearsOfExperience *int      `json:"years_of_experience"`
	IsAvailable       bool      `json:"is_available"`
	IsActive          bool      `json:"is_active"`
	CreatedAt         time.Time `json:"created_at"`
}

// PaginatedCoachesResponse - Respuesta paginada de entrenadores
type PaginatedCoachesResponse struct {
	Success    bool            `json:"success"`
	Data       []CoachListData `json:"data"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}
