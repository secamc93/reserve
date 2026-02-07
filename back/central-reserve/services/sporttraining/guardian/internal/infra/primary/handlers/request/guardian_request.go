package request

// CreateGuardianRequest - Request para crear tutor
type CreateGuardianRequest struct {
	FirstName        string  `json:"first_name" binding:"required"`
	LastName         string  `json:"last_name" binding:"required"`
	DocumentType     string  `json:"document_type" binding:"required"`
	DocumentNumber   string  `json:"document_number" binding:"required"`
	Email            string  `json:"email" binding:"required"`
	Phone            string  `json:"phone" binding:"required"`
	SecondaryPhone   *string `json:"secondary_phone"`
	Address          string  `json:"address"`
	City             string  `json:"city"`
	State            string  `json:"state"`
	Country          string  `json:"country"`
	Relationship     string  `json:"relationship"`
	PhotoURL         string  `json:"photo_url"`
	Notes            string  `json:"notes"`
	CanBookSessions  bool    `json:"can_book_sessions"`
	CanAccessRecords bool    `json:"can_access_records"`
}

// UpdateGuardianRequest - Request para actualizar tutor
type UpdateGuardianRequest struct {
	FirstName        string  `json:"first_name" binding:"required"`
	LastName         string  `json:"last_name" binding:"required"`
	DocumentType     string  `json:"document_type" binding:"required"`
	DocumentNumber   string  `json:"document_number" binding:"required"`
	Email            string  `json:"email" binding:"required"`
	Phone            string  `json:"phone" binding:"required"`
	SecondaryPhone   *string `json:"secondary_phone"`
	Address          string  `json:"address"`
	City             string  `json:"city"`
	State            string  `json:"state"`
	Country          string  `json:"country"`
	Relationship     string  `json:"relationship"`
	PhotoURL         string  `json:"photo_url"`
	Notes            string  `json:"notes"`
	CanBookSessions  bool    `json:"can_book_sessions"`
	CanAccessRecords bool    `json:"can_access_records"`
	IsActive         *bool   `json:"is_active"`
}

// AssignGuardianRequest - Request para asignar tutor a jugador
type AssignGuardianRequest struct {
	GuardianID          uint   `json:"guardian_id" binding:"required"`
	RelationshipType    string `json:"relationship_type" binding:"required"`
	IsPrimaryGuardian   bool   `json:"is_primary_guardian"`
	CanPickup           bool   `json:"can_pickup"`
	CanBookSessions     bool   `json:"can_book_sessions"`
	HasMedicalAuthority bool   `json:"has_medical_authority"`
}
