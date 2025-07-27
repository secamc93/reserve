package domain

import (
	"dbpostgres/app/infra/models"
)

// Repository interfaces para cada entidad
// Estas interfaces definen los contratos que deben implementar los repositorios

// PermissionRepository define las operaciones para permisos
type PermissionRepository interface {
	Create(permission *models.Permission) error
	GetByCode(code string) (*models.Permission, error)
	GetAll() ([]models.Permission, error)
	ExistsByCode(code string) (bool, error)
}

// RoleRepository define las operaciones para roles
type RoleRepository interface {
	Create(role *models.Role) error
	GetByCode(code string) (*models.Role, error)
	GetAll() ([]models.Role, error)
	ExistsByCode(code string) (bool, error)
	AssignPermissions(roleID uint, permissionIDs []uint) error
}

// UserRepository define las operaciones de usuarios
type UserRepository interface {
	Create(user *models.User) error
	GetByEmail(email string) (*models.User, error)
	GetByID(id uint) (*models.User, error)
	ExistsByEmail(email string) (bool, error)
	AssignRoles(userID uint, roleIDs []uint) error
	UserExists() (bool, error)
	ValidatePassword(hashedPassword, password string) error
}

// BusinessRepository define las operaciones para negocios
type BusinessRepository interface {
	Create(business *models.Business) error
	GetByCode(code string) (*models.Business, error)
	GetByID(id uint) (*models.Business, error)
	ExistsByCode(code string) (bool, error)
}

// TableRepository define las operaciones para mesas
type TableRepository interface {
	Create(table *models.Table) error
	GetByBusinessAndNumber(businessID uint, number int) (*models.Table, error)
	GetByBusiness(businessID uint) ([]models.Table, error)
	ExistsByBusinessAndNumber(businessID uint, number int) (bool, error)
}

// ReservationStatusRepository define las operaciones para estados de reserva
type ReservationStatusRepository interface {
	Create(status *models.ReservationStatus) error
	GetByCode(code string) (*models.ReservationStatus, error)
	GetAll() ([]models.ReservationStatus, error)
	ExistsByCode(code string) (bool, error)
}

// SystemRepository define las operaciones del sistema para migraciones
type SystemRepository interface {
	// Métodos específicos para migraciones del sistema
	InitializePermissions(permissions []models.Permission) error
	InitializeRoles(roles []models.Role) error
	InitializeUsers(users []models.User) error
	InitializeBusinesses(businesses []models.Business) error
	InitializeTables(tables []models.Table) error
	InitializeReservationStatuses(statuses []models.ReservationStatus) error
	AssignPermissionsToRole(roleCode string, permissionCodes []string) error
	AssignRolesToUser(userEmail string, roleCodes []string) error

	// Métodos de usuario para migraciones
	ExistsByEmail(email string) (bool, error)
	Create(user *models.User) error
	UserExists() (bool, error)

	// Métodos de negocio para migraciones
	ExistsByCode(code string) (bool, error)
	CreateBusiness(business *models.Business) error

	// Métodos de mesa para migraciones
	ExistsByBusinessAndNumber(businessID uint, number int) (bool, error)

	// Métodos de consulta para roles y permisos
	GetRoleByCode(code string) (*models.Role, error)
	GetPermissionByCode(code string) (*models.Permission, error)

	// Métodos de estados de reserva
	GetAllReservationStatuses() ([]models.ReservationStatus, error)

	// Métodos para nuevos modelos (Scope, BusinessType, Business)
	InitializeScopes(scopes []models.Scope) error
	InitializeBusinessTypes(businessTypes []models.BusinessType) error
	GetScopeByCode(code string) (*models.Scope, error)
	GetBusinessTypeByCode(code string) (*models.BusinessType, error)
	ExistsScopeByCode(code string) (bool, error)
	ExistsBusinessTypeByCode(code string) (bool, error)
	ExistsBusinessByCode(code string) (bool, error)
	ExistsRoleByCode(code string) (bool, error)
	ExistsPermissionByCode(code string) (bool, error)
}
