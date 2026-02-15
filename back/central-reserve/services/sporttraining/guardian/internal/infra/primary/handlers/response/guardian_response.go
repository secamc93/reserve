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

// GuardianResponse - Respuesta de tutor
type GuardianResponse struct {
	Success bool         `json:"success"`
	Data    GuardianData `json:"data"`
}

// GuardianData - Datos completos del tutor
type GuardianData struct {
	ID               uint      `json:"id"`
	BusinessID       uint      `json:"business_id"`
	FirstName        string    `json:"first_name"`
	LastName         string    `json:"last_name"`
	DocumentType     string    `json:"document_type"`
	DocumentNumber   string    `json:"document_number"`
	Email            string    `json:"email"`
	Phone            string    `json:"phone"`
	SecondaryPhone   *string   `json:"secondary_phone"`
	Address          string    `json:"address"`
	City             string    `json:"city"`
	State            string    `json:"state"`
	Country          string    `json:"country"`
	Relationship     string    `json:"relationship"`
	PhotoURL         string    `json:"photo_url"`
	Notes            string    `json:"notes"`
	CanBookSessions  bool      `json:"can_book_sessions"`
	CanAccessRecords bool      `json:"can_access_records"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// GuardianListData - Datos de tutor para lista
type GuardianListData struct {
	ID             uint      `json:"id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	DocumentNumber string    `json:"document_number"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	Relationship   string    `json:"relationship"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

// PaginatedGuardiansResponse - Respuesta paginada de tutores
type PaginatedGuardiansResponse struct {
	Success    bool               `json:"success"`
	Data       []GuardianListData `json:"data"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"page_size"`
	TotalPages int                `json:"total_pages"`
}

// PlayerGuardianData - Datos de tutor de jugador
type PlayerGuardianData struct {
	ID                  uint      `json:"id"`
	FirstName           string    `json:"first_name"`
	LastName            string    `json:"last_name"`
	DocumentNumber      string    `json:"document_number"`
	Email               string    `json:"email"`
	Phone               string    `json:"phone"`
	RelationshipType    string    `json:"relationship_type"`
	IsPrimaryGuardian   bool      `json:"is_primary_guardian"`
	CanPickup           bool      `json:"can_pickup"`
	CanBookSessions     bool      `json:"can_book_sessions"`
	HasMedicalAuthority bool      `json:"has_medical_authority"`
	StartDate           time.Time `json:"start_date"`
}

// PlayerGuardiansResponse - Respuesta de tutores de jugador
type PlayerGuardiansResponse struct {
	Success bool                 `json:"success"`
	Data    []PlayerGuardianData `json:"data"`
}
