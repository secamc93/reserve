package dtos

import "time"

type LoginRequest struct {
	Email    string
	Password string
}

type LoginResponse struct {
	Success               bool
	Message               string
	User                  UserInfo
	Token                 string
	RequirePasswordChange bool
	Businesses            []BusinessInfo
}

type UserInfo struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
}

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

type BusinessInfo struct {
	ID                 uint
	Name               string
	Code               string
	BusinessTypeID     uint
	BusinessType       BusinessTypeInfo
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
}

type BusinessTypeInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Icon        string
}

type UserRolesPermissionsResponse struct {
	Success     bool
	Message     string
	UserID      uint
	Email       string
	IsSuper     bool
	Roles       []RoleInfo
	Permissions []PermissionInfo
}

type RoleInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Level       int
	IsSystem    bool
	Scope       string
}

type PermissionInfo struct {
	ID          uint
	Name        string
	Code        string
	Description string
	Resource    string
	Action      string
	Scope       string
}

type ChangePasswordRequest struct {
	UserID          uint
	CurrentPassword string
	NewPassword     string
}

type ChangePasswordResponse struct {
	Success bool
	Message string
}

type GenerateAPIKeyRequest struct {
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	RequesterID uint
}

type GenerateAPIKeyResponse struct {
	Success    bool
	Message    string
	APIKey     string
	APIKeyInfo APIKeyInfo
}

type APIKeyInfo struct {
	ID          uint
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	RateLimit   int
	CreatedAt   time.Time
}

type ValidateAPIKeyRequest struct {
	APIKey string
}

type ValidateAPIKeyResponse struct {
	Success    bool
	Message    string
	UserID     uint
	Email      string
	BusinessID uint
	Roles      []string
	APIKeyID   uint
}
