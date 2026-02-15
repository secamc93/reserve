package request

// CreateCoachRequest - Request para crear entrenador
type CreateCoachRequest struct {
	UserID             uint     `json:"user_id" binding:"required"`
	FirstName          string   `json:"first_name" binding:"required"`
	LastName           string   `json:"last_name" binding:"required"`
	DocumentType       string   `json:"document_type" binding:"required"`
	DocumentNumber     string   `json:"document_number" binding:"required"`
	Email              string   `json:"email" binding:"required,email"`
	Phone              string   `json:"phone" binding:"required"`
	LicenseNumber      *string  `json:"license_number"`
	YearsOfExperience  *int     `json:"years_of_experience"`
	Biography          string   `json:"biography"`
	Certifications     string   `json:"certifications"`
	MaxSessionsPerDay  *int     `json:"max_sessions_per_day"`
	MaxSessionsPerWeek *int     `json:"max_sessions_per_week"`
	HourlyRate         *float64 `json:"hourly_rate"`
	PhotoURL           string   `json:"photo_url"`
	Notes              string   `json:"notes"`
}

// UpdateCoachRequest - Request para actualizar entrenador
type UpdateCoachRequest struct {
	FirstName          string   `json:"first_name" binding:"required"`
	LastName           string   `json:"last_name" binding:"required"`
	DocumentType       string   `json:"document_type" binding:"required"`
	DocumentNumber     string   `json:"document_number" binding:"required"`
	Email              string   `json:"email" binding:"required,email"`
	Phone              string   `json:"phone" binding:"required"`
	LicenseNumber      *string  `json:"license_number"`
	YearsOfExperience  *int     `json:"years_of_experience"`
	Biography          string   `json:"biography"`
	Certifications     string   `json:"certifications"`
	IsAvailable        *bool    `json:"is_available"`
	MaxSessionsPerDay  *int     `json:"max_sessions_per_day"`
	MaxSessionsPerWeek *int     `json:"max_sessions_per_week"`
	HourlyRate         *float64 `json:"hourly_rate"`
	PhotoURL           string   `json:"photo_url"`
	Notes              string   `json:"notes"`
	IsActive           *bool    `json:"is_active"`
}

// AssignSpecialtyRequest - Request para asignar especialidad
type AssignSpecialtyRequest struct {
	SpecialtyID      uint `json:"specialty_id" binding:"required"`
	ProficiencyLevel int  `json:"proficiency_level" binding:"required,min=1,max=5"`
}
