package request

// CreatePlayerRequest - Request para crear jugador
type CreatePlayerRequest struct {
	FirstName           string   `json:"first_name" binding:"required"`
	LastName            string   `json:"last_name" binding:"required"`
	DocumentType        string   `json:"document_type" binding:"required"`
	DocumentNumber      string   `json:"document_number" binding:"required"`
	DateOfBirth         string   `json:"date_of_birth" binding:"required"`
	Gender              string   `json:"gender" binding:"required"`
	Email               *string  `json:"email"`
	Phone               *string  `json:"phone"`
	Address             string   `json:"address"`
	City                string   `json:"city"`
	State               string   `json:"state"`
	Country             string   `json:"country"`
	SkillLevelID        *uint    `json:"skill_level_id"`
	PreferredPosition   string   `json:"preferred_position"`
	Height              *float64 `json:"height"`
	Weight              *float64 `json:"weight"`
	JerseyNumber        *int     `json:"jersey_number"`
	BloodType           string   `json:"blood_type"`
	HasAllergies        bool     `json:"has_allergies"`
	AllergyDetails      string   `json:"allergy_details"`
	HasMedicalCondition bool     `json:"has_medical_condition"`
	MedicalDetails      string   `json:"medical_details"`
	EmergencyContact    string   `json:"emergency_contact"`
	EmergencyPhone      string   `json:"emergency_phone"`
	PhotoURL            string   `json:"photo_url"`
	Notes               string   `json:"notes"`
}

// UpdatePlayerRequest - Request para actualizar jugador
type UpdatePlayerRequest struct {
	FirstName           string   `json:"first_name" binding:"required"`
	LastName            string   `json:"last_name" binding:"required"`
	DocumentType        string   `json:"document_type" binding:"required"`
	DocumentNumber      string   `json:"document_number" binding:"required"`
	DateOfBirth         string   `json:"date_of_birth" binding:"required"`
	Gender              string   `json:"gender" binding:"required"`
	Email               *string  `json:"email"`
	Phone               *string  `json:"phone"`
	Address             string   `json:"address"`
	City                string   `json:"city"`
	State               string   `json:"state"`
	Country             string   `json:"country"`
	SkillLevelID        *uint    `json:"skill_level_id"`
	PreferredPosition   string   `json:"preferred_position"`
	Height              *float64 `json:"height"`
	Weight              *float64 `json:"weight"`
	JerseyNumber        *int     `json:"jersey_number"`
	BloodType           string   `json:"blood_type"`
	HasAllergies        bool     `json:"has_allergies"`
	AllergyDetails      string   `json:"allergy_details"`
	HasMedicalCondition bool     `json:"has_medical_condition"`
	MedicalDetails      string   `json:"medical_details"`
	EmergencyContact    string   `json:"emergency_contact"`
	EmergencyPhone      string   `json:"emergency_phone"`
	PhotoURL            string   `json:"photo_url"`
	Notes               string   `json:"notes"`
	IsActive            *bool    `json:"is_active"`
}
