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
	Color        string `json:"color" example:"#22c55e"`
	DisplayOrder int    `json:"display_order" example:"1"`
	IsActive     bool   `json:"is_active" example:"true"`
}

// VoteResponse - Response para voto
type VoteResponse struct {
	ID             uint      `json:"id" example:"1"`
	VotingID       uint      `json:"voting_id" example:"1"`
	PropertyUnitID uint      `json:"property_unit_id" example:"10"`
	VotingOptionID uint      `json:"voting_option_id" example:"1"`
	OptionText     string    `json:"option_text,omitempty" example:"Sí, apruebo"`
	OptionCode     string    `json:"option_code,omitempty" example:"YES"`
	Color          string    `json:"color,omitempty" example:"#22c55e"`
	VotedAt        time.Time `json:"voted_at" example:"2025-03-05T14:30:00Z"`
	IPAddress      string    `json:"ip_address,omitempty" example:"192.168.1.100"`
	UserAgent      string    `json:"user_agent,omitempty" example:"Mozilla/5.0"`
	Notes          string    `json:"notes,omitempty" example:"Voto emitido correctamente"`
}

// VotingResultResponse - Response para resultados de votación
type VotingResultResponse struct {
	VotingOptionID uint    `json:"voting_option_id" example:"1"`
	OptionText     string  `json:"option_text" example:"Sí, apruebo"`
	OptionCode     string  `json:"option_code" example:"YES"`
	Color          string  `json:"color" example:"#22c55e"`
	VoteCount      int     `json:"vote_count" example:"45"`
	Percentage     float64 `json:"percentage" example:"75.5"`
}

// UnitWithResidentResponse - Response para unidad con residente
type UnitWithResidentResponse struct {
	PropertyUnitID     uint    `json:"property_unit_id" example:"1"`
	PropertyUnitNumber string  `json:"property_unit_number" example:"101"`
	ResidentID         *uint   `json:"resident_id,omitempty" example:"5"`
	ResidentName       *string `json:"resident_name,omitempty" example:"Juan Pérez"`
}

// VotingDetailByUnitResponse - Response para detalle de votación por unidad
type VotingDetailByUnitResponse struct {
	PropertyUnitID           uint     `json:"property_unit_id" example:"1"`
	PropertyUnitNumber       string   `json:"property_unit_number" example:"101"`
	ParticipationCoefficient *float64 `json:"participation_coefficient" example:"0.008333"`
	ResidentID               *uint    `json:"resident_id" example:"5"`
	ResidentName             *string  `json:"resident_name" example:"Juan Pérez"`
	HasVoted                 bool     `json:"has_voted" example:"true"`
	HasAttendance            bool     `json:"has_attendance" example:"true"` // ✅ NUEVO: Indica si tiene asistencia marcada
	VotingOptionID           *uint    `json:"voting_option_id" example:"3"`
	OptionText               *string  `json:"option_text" example:"Sí"`
	OptionCode               *string  `json:"option_code" example:"yes"`
	OptionColor              *string  `json:"option_color" example:"#22c55e"`
	VotedAt                  *string  `json:"voted_at" example:"2025-10-13T01:30:00Z"`
}

// UnvotedUnitResponse - Response para unidad que no ha votado
type UnvotedUnitResponse struct {
	UnitID       uint   `json:"unit_id" example:"123"`
	UnitNumber   string `json:"unit_number" example:"Apto 101"`
	ResidentID   uint   `json:"resident_id" example:"456"`
	ResidentName string `json:"resident_name" example:"Juan Pérez"`
}

// VotingWithStatusResponse - Response para votación con estado de voto del usuario (público)
type VotingWithStatusResponse struct {
	ID                 uint     `json:"id"`
	VotingGroupID      uint     `json:"voting_group_id"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	VotingType         string   `json:"voting_type"`
	IsSecret           bool     `json:"is_secret"`
	AllowAbstention    bool     `json:"allow_abstention"`
	IsActive           bool     `json:"is_active"`
	DisplayOrder       int      `json:"display_order"`
	RequiredPercentage *float64 `json:"required_percentage,omitempty"`
	OptionsCount       int      `json:"options_count"`
	HasVoted           bool     `json:"has_voted"`
}

// BulkVoteResultResponse - Response para resultado de votación masiva
type BulkVoteResultResponse struct {
	TotalProcessed int                        `json:"total_processed"`
	Succeeded      int                        `json:"succeeded"`
	Failed         int                        `json:"failed"`
	Results        []BulkVoteItemResultResponse `json:"results"`
}

// BulkVoteItemResultResponse - Response para resultado individual de votación masiva
type BulkVoteItemResultResponse struct {
	PropertyUnitID uint          `json:"property_unit_id"`
	Success        bool          `json:"success"`
	Vote           *VoteResponse `json:"vote,omitempty"`
	Error          string        `json:"error,omitempty"`
}

// BulkVoteSuccess - Tipo de respuesta para votación masiva exitosa
type BulkVoteSuccess = SuccessResponse[BulkVoteResultResponse]

// ResetVotingResultResponse - Response para resultado de reseteo de votación
type ResetVotingResultResponse struct {
	VotingID     uint `json:"voting_id" example:"1"`
	DeletedCount int  `json:"deleted_count" example:"45"`
}

// ResetVotingSuccess - Tipo de respuesta para reseteo exitoso
type ResetVotingSuccess = SuccessResponse[ResetVotingResultResponse]

// PreviousVotingVotedUnitsResponse - Response para unidades que votaron en la votación anterior
type PreviousVotingVotedUnitsResponse struct {
	PreviousVotingID    uint   `json:"previous_voting_id" example:"1"`
	PreviousVotingTitle string `json:"previous_voting_title" example:"Aprobación de presupuesto"`
	VotedUnitIDs        []uint `json:"voted_unit_ids" example:"1,2,3"`
	TotalVoted          int    `json:"total_voted" example:"45"`
}

// PreviousVotingVotedUnitsSuccess - Tipo de respuesta para unidades de votación anterior
type PreviousVotingVotedUnitsSuccess = SuccessResponse[PreviousVotingVotedUnitsResponse]

// Tipos de respuesta con datos
type VotingGroupSuccess = SuccessResponse[VotingGroupResponse]
type VotingGroupsSuccess = SuccessResponse[[]VotingGroupResponse]
type VotingSuccess = SuccessResponse[VotingResponse]
type VotingsSuccess = SuccessResponse[[]VotingResponse]
type VotingOptionSuccess = SuccessResponse[VotingOptionResponse]
type VotingOptionsSuccess = SuccessResponse[[]VotingOptionResponse]
type VoteSuccess = SuccessResponse[VoteResponse]
type VotesSuccess = SuccessResponse[[]VoteResponse]
type UnvotedUnitsSuccess = SuccessResponse[[]UnvotedUnitResponse]
