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

// PlayerResponse - Respuesta de jugador
type PlayerResponse struct {
	Success bool       `json:"success"`
	Data    PlayerData `json:"data"`
}

// PlayerData - Datos completos del jugador
type PlayerData struct {
	ID                  uint       `json:"id"`
	BusinessID          uint       `json:"business_id"`
	FirstName           string     `json:"first_name"`
	LastName            string     `json:"last_name"`
	DocumentType        string     `json:"document_type"`
	DocumentNumber      string     `json:"document_number"`
	DateOfBirth         time.Time  `json:"date_of_birth"`
	Gender              string     `json:"gender"`
	Email               *string    `json:"email"`
	Phone               *string    `json:"phone"`
	Address             string     `json:"address"`
	City                string     `json:"city"`
	State               string     `json:"state"`
	Country             string     `json:"country"`
	SkillLevelID        *uint      `json:"skill_level_id"`
	SkillLevelName      string     `json:"skill_level_name,omitempty"`
	PreferredPosition   string     `json:"preferred_position"`
	Height              *float64   `json:"height"`
	Weight              *float64   `json:"weight"`
	JerseyNumber        *int       `json:"jersey_number"`
	BloodType           string     `json:"blood_type"`
	HasAllergies        bool       `json:"has_allergies"`
	AllergyDetails      string     `json:"allergy_details"`
	HasMedicalCondition bool       `json:"has_medical_condition"`
	MedicalDetails      string     `json:"medical_details"`
	EmergencyContact    string     `json:"emergency_contact"`
	EmergencyPhone      string     `json:"emergency_phone"`
	PhotoURL            string     `json:"photo_url"`
	Notes               string     `json:"notes"`
	IsActive            bool       `json:"is_active"`
	IsMinor             bool       `json:"is_minor"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// PlayerListData - Datos de jugador para lista
type PlayerListData struct {
	ID                uint      `json:"id"`
	FirstName         string    `json:"first_name"`
	LastName          string    `json:"last_name"`
	DocumentNumber    string    `json:"document_number"`
	DateOfBirth       time.Time `json:"date_of_birth"`
	Gender            string    `json:"gender"`
	Email             *string   `json:"email"`
	Phone             *string   `json:"phone"`
	PreferredPosition string    `json:"preferred_position"`
	SkillLevelName    string    `json:"skill_level_name"`
	IsMinor           bool      `json:"is_minor"`
	IsActive          bool      `json:"is_active"`
	CreatedAt         time.Time `json:"created_at"`
}

// PaginatedPlayersResponse - Respuesta paginada de jugadores
type PaginatedPlayersResponse struct {
	Success    bool             `json:"success"`
	Data       []PlayerListData `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}
