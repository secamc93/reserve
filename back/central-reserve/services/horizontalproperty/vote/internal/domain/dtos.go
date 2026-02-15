package domain

import "time"

// CreateVotingGroupDTO - DTO para crear un grupo de votaciones
type CreateVotingGroupDTO struct {
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string
}

// VotingGroupDTO - DTO para respuesta de grupo de votaciones
type VotingGroupDTO struct {
	ID               uint
	BusinessID       uint
	Name             string
	Description      string
	VotingStartDate  time.Time
	VotingEndDate    time.Time
	IsActive         bool
	RequiresQuorum   bool
	QuorumPercentage *float64
	CreatedByUserID  *uint
	Notes            string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// CreateVotingDTO - DTO para crear una votación
type CreateVotingDTO struct {
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	DisplayOrder       int
	RequiredPercentage *float64
}

// VotingDTO - DTO para respuesta de una votación
type VotingDTO struct {
	ID                 uint
	VotingGroupID      uint
	Title              string
	Description        string
	VotingType         string
	IsSecret           bool
	AllowAbstention    bool
	IsActive           bool
	DisplayOrder       int
	RequiredPercentage *float64
	CreatedAt          time.Time
	UpdatedAt          time.Time
	Options            []VotingOptionDTO
}

// CreateVotingOptionDTO - DTO para crear una opción de votación
type CreateVotingOptionDTO struct {
	VotingID     uint
	OptionText   string
	OptionCode   string
	Color        string
	DisplayOrder int
}

// VotingOptionDTO - DTO para respuesta de opción de votación
type VotingOptionDTO struct {
	ID           uint
	VotingID     uint
	OptionText   string
	OptionCode   string
	Color        string
	DisplayOrder int
	IsActive     bool
}

// CreateVoteDTO - DTO para emitir un voto
type CreateVoteDTO struct {
	VotingID       uint
	PropertyUnitID uint
	VotingOptionID uint
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VoteDTO - DTO para respuesta de voto
type VoteDTO struct {
	ID             uint
	VotingID       uint
	PropertyUnitID uint
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	OptionColor    string
	VotedAt        time.Time
	IPAddress      string
	UserAgent      string
	Notes          string
}

// VoteEvent - Evento de voto para SSE
type VoteEvent struct {
	Type string // "new_vote" o "vote_deleted"
	Vote VoteDTO
}

// VotingResultDTO - DTO para resultados de votación
type VotingResultDTO struct {
	VotingOptionID uint
	OptionText     string
	OptionCode     string
	Color          string
	VoteCount      int
	Percentage     float64
}

// VotingDetailByUnitDTO - DTO para detalle de votación por unidad
type VotingDetailByUnitDTO struct {
	PropertyUnitID           uint
	PropertyUnitNumber       string
	ParticipationCoefficient *float64
	ResidentID               *uint
	ResidentName             *string
	HasVoted                 bool
	HasAttendance            bool     // ✅ NUEVO: Indica si la unidad tiene asistencia marcada
	VotingOptionID           *uint
	OptionText               *string
	OptionCode               *string
	OptionColor              *string
	VotedAt                  *string
}

// UnitWithResidentDTO - DTO simple para unidad con su residente principal
type UnitWithResidentDTO struct {
	PropertyUnitID     uint
	PropertyUnitNumber string
	ResidentID         *uint
	ResidentName       *string
}

// UnvotedUnitDTO - DTO para unidades que no han votado
type UnvotedUnitDTO struct {
	UnitID       uint   `json:"unit_id" example:"123"`
	UnitNumber   string `json:"unit_number" example:"Apto 101"`
	ResidentID   uint   `json:"resident_id" example:"456"`
	ResidentName string `json:"resident_name" example:"Juan Pérez"`
}

// ResidentBasicDTO - DTO básico de residente para validación pública
type ResidentBasicDTO struct {
	ID                 uint
	Name               string
	PropertyUnitID     uint
	PropertyUnitNumber string
}

// PropertyUnitDetailDTO - DTO para respuesta detallada de unidad
type PropertyUnitDetailDTO struct {
	ID                       uint
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
	IsActive                 bool
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

// PaginatedPropertyUnitsDTO - DTO para respuesta paginada
type PaginatedPropertyUnitsDTO struct {
	Units      []PropertyUnitListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// PropertyUnitListDTO - DTO para listado de unidades
type PropertyUnitListDTO struct {
	ID                       uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	IsActive                 bool
}

// PropertyUnitFiltersDTO - DTO para filtros de búsqueda
type PropertyUnitFiltersDTO struct {
	BusinessID uint
	Number     string
	UnitType   string
	Floor      *int
	Block      string
	IsActive   *bool
	Page       int
	PageSize   int
}

// CreatePropertyUnitDTO - DTO para crear unidad de propiedad
type CreatePropertyUnitDTO struct {
	BusinessID               uint
	Number                   string
	Floor                    *int
	Block                    string
	UnitType                 string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              string
}

// UpdatePropertyUnitDTO - DTO para actualizar unidad de propiedad
type UpdatePropertyUnitDTO struct {
	Number                   *string
	Floor                    *int
	Block                    *string
	UnitType                 *string
	Area                     *float64
	Bedrooms                 *int
	Bathrooms                *int
	ParticipationCoefficient *float64
	Description              *string
	IsActive                 *bool
}

// HorizontalPropertyDTO - DTO básico de propiedad horizontal
type HorizontalPropertyDTO struct {
	ID      uint
	Name    string
	Address string
}

// ImportPropertyUnitsResult - Resultado de la importación de unidades
type ImportPropertyUnitsResult struct {
	Total   int
	Created int
	Skipped int
	Errors  []string
}
