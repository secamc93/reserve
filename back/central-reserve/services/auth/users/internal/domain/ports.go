package domain

import (
	"context"
	"io"
	"mime/multipart"
)

// IUserRepository define las operaciones del repositorio de usuarios
// Esta interfaz contiene solo los métodos que se usan en los casos de uso del módulo users
type IUserRepository interface {
	// Métodos de usuarios
	GetUserByEmail(ctx context.Context, email string) (*UserAuthInfo, error)
	GetUserByID(ctx context.Context, userID uint) (*UserAuthInfo, error)
	GetUsers(ctx context.Context, filters UserFilters) ([]UserQueryDTO, int64, error)
	CreateUser(ctx context.Context, user UsersEntity) (uint, error)
	UpdateUser(ctx context.Context, id uint, user UsersEntity) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)

	// Métodos de relaciones usuario-business
	GetUserBusinesses(ctx context.Context, userID uint) ([]BusinessInfoEntity, error)
	AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error

	// Métodos de roles
	GetUserRoles(ctx context.Context, userID uint) ([]Role, error)
	GetUserRoleByBusiness(ctx context.Context, userID uint, businessID uint) (*Role, error)
	GetRoleByID(ctx context.Context, roleID uint) (*Role, error)

	// Métodos de relaciones business_staff
	GetBusinessStaffRelationships(ctx context.Context, userID uint) ([]BusinessRoleAssignmentDetailed, error)
	AssignRoleToUserBusiness(ctx context.Context, userID uint, assignments []BusinessRoleAssignment) error
}
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
