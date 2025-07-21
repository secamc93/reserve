package ports

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"time"
)

// IClientUseCaseRepository define los métodos que necesita ClientUseCase
type IClientUseCaseRepository interface {
	GetClients(ctx context.Context) ([]entities.Client, error)
	GetClientByID(ctx context.Context, id uint) (*entities.Client, error)
	CreateClient(ctx context.Context, client entities.Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client entities.Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
	GetClientByEmail(ctx context.Context, email string) (*entities.Client, error)
}

// ITableUseCaseRepository define los métodos que necesita TableUseCase
type ITableUseCaseRepository interface {
	CreateTable(ctx context.Context, table entities.Table) (string, error)
	GetTables(ctx context.Context) ([]entities.Table, error)
	GetTableByID(ctx context.Context, id uint) (*entities.Table, error)
	UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}

// IAuthUseCaseRepository define los métodos que necesita AuthUseCase
type IAuthUseCaseRepository interface {
	GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
}

// IReserveUseCaseRepository define los métodos que necesita ReserveUseCase
type IReserveUseCaseRepository interface {
	// Métodos de clientes que necesita
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*entities.Client, error)
	CreateClient(ctx context.Context, client entities.Client) (string, error)

	// Métodos de reservas que necesita
	CreateReserve(ctx context.Context, reserve entities.Reservation) (string, error)
	GetLatestReservationByClient(ctx context.Context, clientID uint) (*entities.Reservation, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]dtos.ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*dtos.ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error)
	CreateReservationStatusHistory(ctx context.Context, history entities.ReservationStatusHistory) error
}

// IBusinessTypeUseCaseRepository define los métodos que necesita BusinessTypeUseCase
type IBusinessTypeUseCaseRepository interface {
	GetBusinessTypes(ctx context.Context) ([]entities.BusinessType, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*entities.BusinessType, error)
	GetBusinessTypeByCode(ctx context.Context, code string) (*entities.BusinessType, error)
	CreateBusinessType(ctx context.Context, businessType entities.BusinessType) (string, error)
	UpdateBusinessType(ctx context.Context, id uint, businessType entities.BusinessType) (string, error)
	DeleteBusinessType(ctx context.Context, id uint) (string, error)
}

// IBusinessUseCaseRepository define los métodos que necesita BusinessUseCase
type IBusinessUseCaseRepository interface {
	GetBusinesses(ctx context.Context) ([]entities.Business, error)
	GetBusinessByID(ctx context.Context, id uint) (*entities.Business, error)
	GetBusinessByCode(ctx context.Context, code string) (*entities.Business, error)
	GetBusinessByCustomDomain(ctx context.Context, domain string) (*entities.Business, error)
	CreateBusiness(ctx context.Context, business entities.Business) (string, error)
	UpdateBusiness(ctx context.Context, id uint, business entities.Business) (string, error)
	DeleteBusiness(ctx context.Context, id uint) (string, error)
}

// IPermissionUseCaseRepository define los métodos que necesita PermissionUseCase
type IPermissionUseCaseRepository interface {
	GetPermissions(ctx context.Context) ([]entities.Permission, error)
	GetPermissionByID(ctx context.Context, id uint) (*entities.Permission, error)
	GetPermissionByCode(ctx context.Context, code string) (*entities.Permission, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]entities.Permission, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]entities.Permission, error)
	CreatePermission(ctx context.Context, permission entities.Permission) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission entities.Permission) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
}

// IScopeUseCaseRepository define los métodos que necesita ScopeUseCase
type IScopeUseCaseRepository interface {
	GetScopes(ctx context.Context) ([]entities.Scope, error)
	GetScopeByID(ctx context.Context, id uint) (*entities.Scope, error)
	GetScopeByCode(ctx context.Context, code string) (*entities.Scope, error)
	CreateScope(ctx context.Context, scope entities.Scope) (string, error)
	UpdateScope(ctx context.Context, id uint, scope entities.Scope) (string, error)
	DeleteScope(ctx context.Context, id uint) (string, error)
}

// IPermissionUseCase define las operaciones de casos de uso para permisos
type IPermissionUseCase interface {
	GetPermissions(ctx context.Context) ([]dtos.PermissionDTO, error)
	GetPermissionByID(ctx context.Context, id uint) (*dtos.PermissionDTO, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]dtos.PermissionDTO, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]dtos.PermissionDTO, error)
	CreatePermission(ctx context.Context, permission dtos.CreatePermissionDTO) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission dtos.UpdatePermissionDTO) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
}

// IScopeUseCase define las operaciones de casos de uso para scopes
type IScopeUseCase interface {
	GetScopes(ctx context.Context) ([]dtos.ScopeDTO, error)
	GetScopeByID(ctx context.Context, id uint) (*dtos.ScopeDTO, error)
	CreateScope(ctx context.Context, scope dtos.CreateScopeDTO) (string, error)
	UpdateScope(ctx context.Context, id uint, scope dtos.UpdateScopeDTO) (string, error)
	DeleteScope(ctx context.Context, id uint) (string, error)
}

// IRoleUseCaseRepository define los métodos que necesita RoleUseCase
type IRoleUseCaseRepository interface {
	GetRoles(ctx context.Context) ([]entities.Role, error)
	GetRoleByID(ctx context.Context, id uint) (*entities.Role, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]entities.Role, error)
	GetRolesByLevel(ctx context.Context, level int) ([]entities.Role, error)
	GetSystemRoles(ctx context.Context) ([]entities.Role, error)
}

// IRoleUseCase define las operaciones de casos de uso para roles
type IRoleUseCase interface {
	GetRoles(ctx context.Context) ([]dtos.RoleDTO, error)
	GetRoleByID(ctx context.Context, id uint) (*dtos.RoleDTO, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]dtos.RoleDTO, error)
	GetRolesByLevel(ctx context.Context, filters dtos.RoleFilters) ([]dtos.RoleDTO, error)
	GetSystemRoles(ctx context.Context) ([]dtos.RoleDTO, error)
}

// IUserUseCaseRepository define los métodos que necesita UserUseCase
type IUserUseCaseRepository interface {
	GetUsers(ctx context.Context, filters dtos.UserFilters) ([]dtos.UserQueryDTO, int64, error)
	GetUserByID(ctx context.Context, id uint) (*entities.User, error)
	GetUserByEmail(ctx context.Context, email string) (*entities.User, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error)
	GetUserBusinesses(ctx context.Context, userID uint) ([]entities.BusinessInfo, error)
	CreateUser(ctx context.Context, user entities.User) (string, error)
	UpdateUser(ctx context.Context, id uint, user entities.User) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
	AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error
	AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error
}

// IUserUseCase define las operaciones de casos de uso para usuarios
type IUserUseCase interface {
	GetUsers(ctx context.Context, filters dtos.UserFilters) (*dtos.UserListDTO, error)
	GetUserByID(ctx context.Context, id uint) (*dtos.UserDTO, error)
	CreateUser(ctx context.Context, user dtos.CreateUserDTO) (string, error)
	UpdateUser(ctx context.Context, id uint, user dtos.UpdateUserDTO) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
}
