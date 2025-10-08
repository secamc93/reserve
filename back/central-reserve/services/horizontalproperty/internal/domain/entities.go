package domain

import "time"

// ═══════════════════════════════════════════════════════════════════
//
//	HORIZONTAL PROPERTY ENTITIES
//
// ═══════════════════════════════════════════════════════════════════

// HorizontalProperty - Entidad de propiedad horizontal
type HorizontalProperty struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	Code             string `json:"code"`
	BusinessTypeID   uint   `json:"business_type_id"`
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

	// Configuración de funcionalidades (heredada de Business)
	EnableDelivery     bool `json:"enable_delivery"`
	EnablePickup       bool `json:"enable_pickup"`
	EnableReservations bool `json:"enable_reservations"`

	// Configuración específica para propiedades horizontales
	TotalUnits    int  `json:"total_units"`
	TotalFloors   *int `json:"total_floors,omitempty"`
	HasElevator   bool `json:"has_elevator"`
	HasParking    bool `json:"has_parking"`
	HasPool       bool `json:"has_pool"`
	HasGym        bool `json:"has_gym"`
	HasSocialArea bool `json:"has_social_area"`

	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// BusinessType - Entidad de tipo de negocio (simplificada para referencias)
type BusinessType struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	IsActive    bool   `json:"is_active"`
}

// ───────────────────────────────────────────
//
//	VOTING DOMAIN ENTITIES
//
// ───────────────────────────────────────────

// VotingGroup - Grupo de votaciones (por ejemplo, Asamblea)
type VotingGroup struct {
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

	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// Voting - Votación individual dentro de un grupo
type Voting struct {
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

	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// VotingOption - Opción de una votación
type VotingOption struct {
	ID           uint   `json:"id"`
	VotingID     uint   `json:"voting_id"`
	OptionText   string `json:"option_text"`
	OptionCode   string `json:"option_code"`
	DisplayOrder int    `json:"display_order"`
	IsActive     bool   `json:"is_active"`
}

// Vote - Voto emitido por un residente
type Vote struct {
	ID             uint      `json:"id"`
	VotingID       uint      `json:"voting_id"`
	ResidentID     uint      `json:"resident_id"`
	VotingOptionID uint      `json:"voting_option_id"`
	VotedAt        time.Time `json:"voted_at"`
	IPAddress      string    `json:"ip_address"`
	UserAgent      string    `json:"user_agent"`
	Notes          string    `json:"notes"`
}
