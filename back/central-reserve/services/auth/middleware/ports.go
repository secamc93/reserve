package middleware

import (
	"context"
	"time"
)

type IAuthService interface {
	Login(ctx context.Context, email, password string) (*LoginResponse, error)
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]Permission, error)
	ValidatePassword(hashedPassword, password string) error
	GenerateToken(userID uint) (string, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
	ValidateAPIKey(ctx context.Context, request ValidateAPIKeyRequest) (*ValidateAPIKeyResponse, error)
}
type IJWTService interface {
	GenerateToken(userID uint) (string, error)
	ValidateToken(tokenString string) (*JWTClaims, error)
	RefreshToken(tokenString string) (string, error)

	// Tokens para business
	GenerateBusinessToken(userID, businessID, businessTypeID, roleID uint) (string, error)
	ValidateBusinessToken(tokenString string) (*BusinessTokenClaims, error)
}
type LoginResponse struct {
	Success               bool
	Message               string
	User                  UserInfo
	Token                 string
	RequirePasswordChange bool
	Businesses            []BusinessInfo
	Scope                 string // Scope del usuario (platform, business, etc.)
	IsSuperAdmin          bool   // Indica si es super admin (scope platform o scope_id 1)
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
type UserInfo struct {
	ID          uint
	Name        string
	Email       string
	Phone       string
	AvatarURL   string
	IsActive    bool
	LastLoginAt *time.Time
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
type Role struct {
	ID               uint
	Name             string
	Description      string
	Level            int
	IsSystem         bool
	ScopeID          uint
	ScopeName        string
	ScopeCode        string
	BusinessTypeID   uint
	BusinessTypeName string
	CreatedAt        time.Time
	UpdatedAt        time.Time
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
