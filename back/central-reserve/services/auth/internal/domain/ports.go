package domain

import (
	"context"
	"io"
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
	GetPermissions(ctx context.Context) ([]Permission, error)
	GetPermissionByID(ctx context.Context, id uint) (*Permission, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]Permission, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]Permission, error)
	CreatePermission(ctx context.Context, permission Permission) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission Permission) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
	GetScopes(ctx context.Context) ([]Scope, error)
	GetScopeByID(ctx context.Context, id uint) (*Scope, error)
	GetScopeByCode(ctx context.Context, code string) (*Scope, error)
	CreateScope(ctx context.Context, scope Scope) (string, error)
	UpdateScope(ctx context.Context, id uint, scope Scope) (string, error)
	DeleteScope(ctx context.Context, id uint) (string, error)
	GetRoles(ctx context.Context) ([]Role, error)
	GetRoleByID(ctx context.Context, id uint) (*Role, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]Role, error)
	GetRolesByLevel(ctx context.Context, level int) ([]Role, error)
	GetSystemRoles(ctx context.Context) ([]Role, error)
	GetUsers(ctx context.Context, filters UserFilters) ([]UserQueryDTO, int64, error)
	CreateUser(ctx context.Context, user UsersEntity) (uint, error)
	UpdateUser(ctx context.Context, id uint, user UsersEntity) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
	AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error
	AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error

	// Métodos para Resource
	GetResources(ctx context.Context, filters ResourceFilters) ([]Resource, int64, error)
	GetResourceByID(ctx context.Context, id uint) (*Resource, error)
	GetResourceByName(ctx context.Context, name string) (*Resource, error)
	CreateResource(ctx context.Context, resource Resource) (uint, error)
	UpdateResource(ctx context.Context, id uint, resource Resource) (string, error)
	DeleteResource(ctx context.Context, id uint) (string, error)
}

// IS3Service define las operaciones de almacenamiento en S3
type IS3Service interface {
	GetImageURL(filename string) string
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
	UploadFile(ctx context.Context, file io.ReadSeeker, filename string) (string, error)
	DownloadFile(ctx context.Context, filename string) (io.ReadSeeker, error)
	FileExists(ctx context.Context, filename string) (bool, error)
	GetFileURL(ctx context.Context, filename string) (string, error)
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (string, error)
}
