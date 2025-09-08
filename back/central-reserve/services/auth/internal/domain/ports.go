package domain

import (
	"context"
	"mime/multipart"
)

// IJWTService define las operaciones de JWT
type IJWTService interface {
	GenerateToken(userID uint, email string, roles []string, businessID uint) (string, error)
	ValidateToken(tokenString string) (*JWTClaims, error)
	RefreshToken(tokenString string) (string, error)
}

// IAuthService define las operaciones de autenticación (métodos de repositorio)
type IAuthService interface {
	Login(ctx context.Context, email, password string) (*LoginResponse, error)
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]Permission, error)
	ValidatePassword(hashedPassword, password string) error
	GenerateToken(userID uint, email string, roles []string, businessID uint) (string, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
}

// IAuthRepository define las operaciones de autenticación
type IAuthRepository interface {
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserByID(ctx context.Context, userID uint) (*UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]Permission, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
	ChangePassword(ctx context.Context, userID uint, newPassword string) error
	GetUserBusinesses(ctx context.Context, userID uint) ([]BusinessInfoEntity, error)
	CreateAPIKey(ctx context.Context, apiKey APIKey, keyHash string) (uint, error)
	ValidateAPIKey(ctx context.Context, apiKey string) (*APIKey, error)
	UpdateAPIKeyLastUsed(ctx context.Context, apiKeyID uint) error
	GetAPIKeysByUser(ctx context.Context, userID uint) ([]APIKeyInfo, error)
	RevokeAPIKey(ctx context.Context, apiKeyID uint) error
}

// IPermissionRepository define las operaciones para permisos
type IPermissionRepository interface {
	GetPermissions(ctx context.Context) ([]Permission, error)
	GetPermissionByID(ctx context.Context, id uint) (*Permission, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]Permission, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]Permission, error)
	CreatePermission(ctx context.Context, permission Permission) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission Permission) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
}

// IScopeRepository define las operaciones para scopes
type IScopeRepository interface {
	GetScopes(ctx context.Context) ([]Scope, error)
	GetScopeByID(ctx context.Context, id uint) (*Scope, error)
	GetScopeByCode(ctx context.Context, code string) (*Scope, error)
	CreateScope(ctx context.Context, scope Scope) (string, error)
	UpdateScope(ctx context.Context, id uint, scope Scope) (string, error)
	DeleteScope(ctx context.Context, id uint) (string, error)
}

// IRoleRepository define los métodos del repositorio de roles
type IRoleRepository interface {
	GetRoles(ctx context.Context) ([]Role, error)
	GetRoleByID(ctx context.Context, id uint) (*Role, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]Role, error)
	GetRolesByLevel(ctx context.Context, level int) ([]Role, error)
	GetSystemRoles(ctx context.Context) ([]Role, error)
}

// IUserRepository define los métodos del repositorio de usuarios
type IUserRepository interface {
	GetUsers(ctx context.Context, filters UserFilters) ([]UserQueryDTO, int64, error)
	GetUserByID(ctx context.Context, id uint) (*UserAuthInfo, error)
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetUserBusinesses(ctx context.Context, userID uint) ([]BusinessInfoEntity, error)
	CreateUser(ctx context.Context, user UsersEntity) (uint, error)
	UpdateUser(ctx context.Context, id uint, user UsersEntity) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
	AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error
	AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error
}

// IS3Service define las operaciones de almacenamiento en S3
type IS3Service interface {
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (string, error) // Retorna path relativo
	GetImageURL(filename string) string                                                         // Genera URL completa
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
}
