package domain

import "time"

// Permission representa un permiso del sistema (copia simplificada del dominio principal)
type Permission struct {
	ID               uint
	Name             string
	Code             string
	Description      string
	Resource         string
	Action           string
	ResourceID       uint
	ActionID         uint // ID de la acción
	ScopeID          uint
	ScopeName        string
	ScopeCode        string
	BusinessTypeID   uint
	BusinessTypeName string
}

// UserAuthInfo representa la información de autenticación del usuario
type UserAuthInfo struct {
	ID          uint
	Name        string
	Email       string
	Password    string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// BusinessInfoEntity representa la información del negocio usada internamente
type BusinessInfoEntity struct {
	ID                 uint
	Name               string
	Code               string
	BusinessTypeID     uint
	Timezone           string
	Address            string
	Description        string
	LogoURL            string
	PrimaryColor       string
	SecondaryColor     string
	TertiaryColor      string
	QuaternaryColor    string
	NavbarImageURL     string
	CustomDomain       string
	IsActive           bool
	EnableDelivery     bool
	EnablePickup       bool
	EnableReservations bool
	BusinessTypeName   string
	BusinessTypeCode   string
}

// BusinessStaffRelation representa la relación completa desde business_staff (user-business-role)
type BusinessStaffRelation struct {
	UserID     uint
	BusinessID *uint               // NULL para super usuarios
	RoleID     *uint               // NULL si aún no tiene rol asignado
	Business   *BusinessInfoEntity // Info del business si business_id no es NULL
}
