package response

import "time"

type SuccessResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

// VotingGroupResponse - Response para grupo de votación
type VotingGroupResponse struct {
	ID               uint      `json:"id" example:"1"`
	BusinessID       uint      `json:"business_id" example:"1"`
	Name             string    `json:"name" example:"Asamblea Ordinaria 2025"`
	Description      string    `json:"description" example:"Primera asamblea del año"`
	VotingStartDate  time.Time `json:"voting_start_date" example:"2025-03-01T08:00:00Z"`
	VotingEndDate    time.Time `json:"voting_end_date" example:"2025-03-15T23:59:59Z"`
	IsActive         bool      `json:"is_active" example:"true"`
	RequiresQuorum   bool      `json:"requires_quorum" example:"true"`
	QuorumPercentage *float64  `json:"quorum_percentage,omitempty" example:"50.0"`
	CreatedByUserID  *uint     `json:"created_by_user_id,omitempty" example:"5"`
	Notes            string    `json:"notes,omitempty" example:"Notas adicionales"`
	CreatedAt        time.Time `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt        time.Time `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

// VotingResponse - Response para votación
type VotingResponse struct {
	ID                 uint      `json:"id" example:"1"`
	VotingGroupID      uint      `json:"voting_group_id" example:"1"`
	Title              string    `json:"title" example:"Aprobación de presupuesto"`
	Description        string    `json:"description" example:"Se votará el presupuesto 2025"`
	VotingType         string    `json:"voting_type" example:"single_choice"`
	IsSecret           bool      `json:"is_secret" example:"false"`
	AllowAbstention    bool      `json:"allow_abstention" example:"true"`
	IsActive           bool      `json:"is_active" example:"true"`
	DisplayOrder       int       `json:"display_order" example:"1"`
	RequiredPercentage *float64  `json:"required_percentage,omitempty" example:"50.0"`
	CreatedAt          time.Time `json:"created_at" example:"2025-01-15T10:30:00Z"`
	UpdatedAt          time.Time `json:"updated_at" example:"2025-01-15T10:30:00Z"`
}

// VotingOptionResponse - Response para opción de votación
type VotingOptionResponse struct {
	ID           uint   `json:"id" example:"1"`
	VotingID     uint   `json:"voting_id" example:"1"`
	OptionText   string `json:"option_text" example:"Sí, apruebo"`
	OptionCode   string `json:"option_code" example:"YES"`
	DisplayOrder int    `json:"display_order" example:"1"`
	IsActive     bool   `json:"is_active" example:"true"`
}

// VoteResponse - Response para voto
type VoteResponse struct {
	ID             uint      `json:"id" example:"1"`
	VotingID       uint      `json:"voting_id" example:"1"`
	ResidentID     uint      `json:"resident_id" example:"10"`
	VotingOptionID uint      `json:"voting_option_id" example:"1"`
	VotedAt        time.Time `json:"voted_at" example:"2025-03-05T14:30:00Z"`
	IPAddress      string    `json:"ip_address,omitempty" example:"192.168.1.100"`
	UserAgent      string    `json:"user_agent,omitempty" example:"Mozilla/5.0"`
	Notes          string    `json:"notes,omitempty" example:"Voto emitido correctamente"`
}

// Tipos de respuesta con datos
type VotingGroupSuccess = SuccessResponse[VotingGroupResponse]
type VotingGroupsSuccess = SuccessResponse[[]VotingGroupResponse]
type VotingSuccess = SuccessResponse[VotingResponse]
type VotingsSuccess = SuccessResponse[[]VotingResponse]
type VotingOptionSuccess = SuccessResponse[VotingOptionResponse]
type VotingOptionsSuccess = SuccessResponse[[]VotingOptionResponse]
type VoteSuccess = SuccessResponse[VoteResponse]
