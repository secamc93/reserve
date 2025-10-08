package domain

import "time"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateHorizontalPropertyDTO - DTO para crear una propiedad horizontal
type CreateHorizontalPropertyDTO struct {
	Name             string `json:"name" validate:"required,min=3,max=120"`
	Code             string `json:"code" validate:"required,min=2,max=50"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone" validate:"required"`
	Address          string `json:"address" validate:"required,max=255"`
	Description      string `json:"description,omitempty" validate:"max=500"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url,omitempty" validate:"max=255,url"`
	PrimaryColor    string `json:"primary_color,omitempty" validate:"hexcolor"`
	SecondaryColor  string `json:"secondary_color,omitempty" validate:"hexcolor"`
	TertiaryColor   string `json:"tertiary_color,omitempty" validate:"hexcolor"`
	QuaternaryColor string `json:"quaternary_color,omitempty" validate:"hexcolor"`
	NavbarImageURL  string `json:"navbar_image_url,omitempty" validate:"max=255,url"`
	CustomDomain    string `json:"custom_domain,omitempty" validate:"max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units" validate:"required,min=1"`
	TotalFloors   *int `json:"total_floors,omitempty" validate:"omitempty,min=1"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`
}

// UpdateHorizontalPropertyDTO - DTO para actualizar una propiedad horizontal
type UpdateHorizontalPropertyDTO struct {
	Name             *string `json:"name,omitempty" validate:"omitempty,min=3,max=120"`
	Code             *string `json:"code,omitempty" validate:"omitempty,min=2,max=50,alphanum"`
	ParentBusinessID *uint   `json:"parent_business_id,omitempty"`
	Timezone         *string `json:"timezone,omitempty"`
	Address          *string `json:"address,omitempty" validate:"omitempty,max=255"`
	Description      *string `json:"description,omitempty" validate:"omitempty,max=500"`

	// Configuración de marca blanca
	LogoURL         *string `json:"logo_url,omitempty" validate:"omitempty,max=255,url"`
	PrimaryColor    *string `json:"primary_color,omitempty" validate:"omitempty,hexcolor"`
	SecondaryColor  *string `json:"secondary_color,omitempty" validate:"omitempty,hexcolor"`
	TertiaryColor   *string `json:"tertiary_color,omitempty" validate:"omitempty,hexcolor"`
	QuaternaryColor *string `json:"quaternary_color,omitempty" validate:"omitempty,hexcolor"`
	NavbarImageURL  *string `json:"navbar_image_url,omitempty" validate:"omitempty,max=255,url"`
	CustomDomain    *string `json:"custom_domain,omitempty" validate:"omitempty,max=100"`

	// Configuración específica para propiedades horizontales
	TotalUnits    *int  `json:"total_units,omitempty" validate:"omitempty,min=1"`
	TotalFloors   *int  `json:"total_floors,omitempty" validate:"omitempty,min=1"`
	HasElevator   *bool `json:"has_elevator,omitempty"`
	HasParking    *bool `json:"has_parking,omitempty"`
	HasPool       *bool `json:"has_pool,omitempty"`
	HasGym        *bool `json:"has_gym,omitempty"`
	HasSocialArea *bool `json:"has_social_area,omitempty"`
	IsActive      *bool `json:"is_active,omitempty"`
}

// HorizontalPropertyDTO - DTO para respuesta de propiedad horizontal
type HorizontalPropertyDTO struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	Code             string `json:"code"`
	BusinessTypeID   uint   `json:"business_type_id"`
	BusinessTypeName string `json:"business_type_name"`
	ParentBusinessID *uint  `json:"parent_business_id,omitempty"`
	Timezone         string `json:"timezone"`
	Address          string `json:"address"`
	Description      string `json:"description"`

	// Configuración de marca blanca
	LogoURL         string `json:"logo_url"`
	PrimaryColor    string `json:"primary_color"`
	SecondaryColor  string `json:"secondary_color"`
	TertiaryColor   string `json:"tertiary_color"`
	QuaternaryColor string `json:"quaternary_color"`
	NavbarImageURL  string `json:"navbar_image_url"`
	CustomDomain    string `json:"custom_domain"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units"`
	TotalFloors   *int `json:"total_floors,omitempty"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`

	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// HorizontalPropertyListDTO - DTO para lista de propiedades horizontales
type HorizontalPropertyListDTO struct {
	ID               uint      `json:"id"`
	Name             string    `json:"name"`
	Code             string    `json:"code"`
	BusinessTypeName string    `json:"business_type_name"`
	Address          string    `json:"address"`
	TotalUnits       int       `json:"total_units"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
}

// HorizontalPropertyFiltersDTO - DTO para filtros de búsqueda
type HorizontalPropertyFiltersDTO struct {
	Name     *string `json:"name,omitempty"`
	Code     *string `json:"code,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
	Page     int     `json:"page" validate:"min=1"`
	PageSize int     `json:"page_size" validate:"min=1,max=100"`
	OrderBy  string  `json:"order_by" validate:"omitempty,oneof=name code created_at updated_at"`
	OrderDir string  `json:"order_dir" validate:"omitempty,oneof=asc desc"`
}

// PaginatedHorizontalPropertyDTO - DTO para respuesta paginada
type PaginatedHorizontalPropertyDTO struct {
	Data       []HorizontalPropertyListDTO `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

// ═══════════════════════════════════════════════════════════════════
//
//  VOTING DTOs
//
// ═══════════════════════════════════════════════════════════════════

// CreateVotingGroupDTO - DTO para crear un grupo de votaciones
type CreateVotingGroupDTO struct {
	BusinessID       uint      `json:"business_id" validate:"required"`
	Name             string    `json:"name" validate:"required,min=3,max=150"`
	Description      string    `json:"description" validate:"max=1000"`
	VotingStartDate  time.Time `json:"voting_start_date" validate:"required"`
	VotingEndDate    time.Time `json:"voting_end_date" validate:"required,gtfield=VotingStartDate"`
	RequiresQuorum   bool      `json:"requires_quorum"`
	QuorumPercentage *float64  `json:"quorum_percentage,omitempty"`
	CreatedByUserID  *uint     `json:"created_by_user_id,omitempty"`
	Notes            string    `json:"notes" validate:"max=2000"`
}

// VotingGroupDTO - DTO para respuesta de grupo de votaciones
type VotingGroupDTO struct {
	ID               uint      `json:"id"`
	BusinessID       uint      `json:"business_id"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	VotingStartDate  time.Time `json:"voting_start_date"`
	VotingEndDate    time.Time `json:"voting_end_date"`
	IsActive         bool      `json:"is_active"`
	RequiresQuorum   bool      `json:"requires_quorum"`
	QuorumPercentage *float64  `json:"quorum_percentage,omitempty"`
	CreatedByUserID  *uint     `json:"created_by_user_id,omitempty"`
	Notes            string    `json:"notes"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// CreateVotingDTO - DTO para crear una votación
type CreateVotingDTO struct {
	VotingGroupID      uint     `json:"voting_group_id" validate:"required"`
	Title              string   `json:"title" validate:"required,min=3,max=200"`
	Description        string   `json:"description" validate:"required,max=2000"`
	VotingType         string   `json:"voting_type" validate:"required,oneof=simple majority unanimity"`
	IsSecret           bool     `json:"is_secret"`
	AllowAbstention    bool     `json:"allow_abstention"`
	DisplayOrder       int      `json:"display_order" validate:"min=1"`
	RequiredPercentage *float64 `json:"required_percentage,omitempty"`
}

// VotingDTO - DTO para respuesta de una votación
type VotingDTO struct {
	ID                 uint      `json:"id"`
	VotingGroupID      uint      `json:"voting_group_id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	VotingType         string    `json:"voting_type"`
	IsSecret           bool      `json:"is_secret"`
	AllowAbstention    bool      `json:"allow_abstention"`
	IsActive           bool      `json:"is_active"`
	DisplayOrder       int       `json:"display_order"`
	RequiredPercentage *float64  `json:"required_percentage,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// CreateVotingOptionDTO - DTO para crear una opción de votación
type CreateVotingOptionDTO struct {
	VotingID     uint   `json:"voting_id" validate:"required"`
	OptionText   string `json:"option_text" validate:"required,min=1,max=100"`
	OptionCode   string `json:"option_code" validate:"required,min=1,max=20"`
	DisplayOrder int    `json:"display_order" validate:"min=1"`
}

// VotingOptionDTO - DTO para respuesta de opción de votación
type VotingOptionDTO struct {
	ID           uint   `json:"id"`
	VotingID     uint   `json:"voting_id"`
	OptionText   string `json:"option_text"`
	OptionCode   string `json:"option_code"`
	DisplayOrder int    `json:"display_order"`
	IsActive     bool   `json:"is_active"`
}

// CreateVoteDTO - DTO para emitir un voto
type CreateVoteDTO struct {
	VotingID       uint   `json:"voting_id" validate:"required"`
	ResidentID     uint   `json:"resident_id" validate:"required"`
	VotingOptionID uint   `json:"voting_option_id" validate:"required"`
	IPAddress      string `json:"ip_address" validate:"max=45"`
	UserAgent      string `json:"user_agent" validate:"max=500"`
	Notes          string `json:"notes" validate:"max=500"`
}

// VoteDTO - DTO para respuesta de voto
type VoteDTO struct {
	ID             uint      `json:"id"`
	VotingID       uint      `json:"voting_id"`
	ResidentID     uint      `json:"resident_id"`
	VotingOptionID uint      `json:"voting_option_id"`
	VotedAt        time.Time `json:"voted_at"`
	IPAddress      string    `json:"ip_address"`
	UserAgent      string    `json:"user_agent"`
	Notes          string    `json:"notes"`
}
