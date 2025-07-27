package ports

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"time"
)

// IClientRepository define las operaciones para clientes
type IClientRepository interface {
	GetClients(ctx context.Context) ([]entities.Client, error)
	GetClientByID(ctx context.Context, id uint) (*entities.Client, error)
	GetClientByEmail(ctx context.Context, email string) (*entities.Client, error)
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*entities.Client, error)
	CreateClient(ctx context.Context, client entities.Client) (string, error)
	UpdateClient(ctx context.Context, id uint, client entities.Client) (string, error)
	DeleteClient(ctx context.Context, id uint) (string, error)
}

// ITableRepository define las operaciones para mesas
type ITableRepository interface {
	CreateTable(ctx context.Context, table entities.Table) (string, error)
	GetTables(ctx context.Context) ([]entities.Table, error)
	GetTableByID(ctx context.Context, id uint) (*entities.Table, error)
	UpdateTable(ctx context.Context, id uint, table entities.Table) (string, error)
	DeleteTable(ctx context.Context, id uint) (string, error)
}

// IRoomRepository define las operaciones para salas
type IRoomRepository interface {
	CreateRoom(ctx context.Context, room entities.Room) (string, error)
	GetRooms(ctx context.Context) ([]entities.Room, error)
	GetRoomsByBusinessID(ctx context.Context, businessID uint) ([]entities.Room, error)
	GetRoomByID(ctx context.Context, id uint) (*entities.Room, error)
	GetRoomByCodeAndBusiness(ctx context.Context, code string, businessID uint) (*entities.Room, error)
	UpdateRoom(ctx context.Context, id uint, room entities.Room) (string, error)
	DeleteRoom(ctx context.Context, id uint) (string, error)
}

// IReservationRepository define las operaciones para reservas
type IReservationRepository interface {
	CreateReserve(ctx context.Context, reserve entities.Reservation) (string, error)
	GetLatestReservationByClient(ctx context.Context, clientID uint) (*entities.Reservation, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]dtos.ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*dtos.ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error)
	CreateReservationStatusHistory(ctx context.Context, history entities.ReservationStatusHistory) error
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*entities.Client, error)
	CreateClient(ctx context.Context, client entities.Client) (string, error)
}

// IAuthRepository define las operaciones de autenticación
type IAuthRepository interface {
	GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error)
	GetUserByID(ctx context.Context, userID uint) (*dtos.UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
	ChangePassword(ctx context.Context, userID uint, newPassword string) error
}

// IAuthService define las operaciones de autenticación (métodos de repositorio)
type IAuthService interface {
	Login(ctx context.Context, email, password string) (*dtos.LoginResponse, error)
	GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error)
	GetRolePermissions(ctx context.Context, roleID uint) ([]entities.Permission, error)
	ValidatePassword(hashedPassword, password string) error
	GenerateToken(userID uint, email string, roles []string) (string, error)
	UpdateLastLogin(ctx context.Context, userID uint) error
}

// IBusinessTypeRepository define las operaciones para tipos de negocio
type IBusinessTypeRepository interface {
	GetBusinessTypes(ctx context.Context) ([]entities.BusinessType, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*entities.BusinessType, error)
	GetBusinessTypeByCode(ctx context.Context, code string) (*entities.BusinessType, error)
	CreateBusinessType(ctx context.Context, businessType entities.BusinessType) (string, error)
	UpdateBusinessType(ctx context.Context, id uint, businessType entities.BusinessType) (string, error)
	DeleteBusinessType(ctx context.Context, id uint) (string, error)
}

// IBusinessRepository define las operaciones para negocios
type IBusinessRepository interface {
	GetBusinesses(ctx context.Context) ([]entities.Business, error)
	GetBusinessByID(ctx context.Context, id uint) (*entities.Business, error)
	GetBusinessByCode(ctx context.Context, code string) (*entities.Business, error)
	GetBusinessByCustomDomain(ctx context.Context, domain string) (*entities.Business, error)
	CreateBusiness(ctx context.Context, business entities.Business) (string, error)
	UpdateBusiness(ctx context.Context, id uint, business entities.Business) (string, error)
	DeleteBusiness(ctx context.Context, id uint) (string, error)
}

// IPermissionRepository define las operaciones para permisos
type IPermissionRepository interface {
	GetPermissions(ctx context.Context) ([]entities.Permission, error)
	GetPermissionByID(ctx context.Context, id uint) (*entities.Permission, error)
	GetPermissionByCode(ctx context.Context, code string) (*entities.Permission, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]entities.Permission, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]entities.Permission, error)
	CreatePermission(ctx context.Context, permission entities.Permission) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission entities.Permission) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
}

// IScopeRepository define las operaciones para scopes
type IScopeRepository interface {
	GetScopes(ctx context.Context) ([]entities.Scope, error)
	GetScopeByID(ctx context.Context, id uint) (*entities.Scope, error)
	GetScopeByCode(ctx context.Context, code string) (*entities.Scope, error)
	CreateScope(ctx context.Context, scope entities.Scope) (string, error)
	UpdateScope(ctx context.Context, id uint, scope entities.Scope) (string, error)
	DeleteScope(ctx context.Context, id uint) (string, error)
}

// IRoleRepository define los métodos del repositorio de roles
type IRoleRepository interface {
	GetRoles(ctx context.Context) ([]entities.Role, error)
	GetRoleByID(ctx context.Context, id uint) (*entities.Role, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]entities.Role, error)
	GetRolesByLevel(ctx context.Context, level int) ([]entities.Role, error)
	GetSystemRoles(ctx context.Context) ([]entities.Role, error)
}

// IUserRepository define los métodos del repositorio de usuarios
type IUserRepository interface {
	GetUsers(ctx context.Context, filters dtos.UserFilters) ([]dtos.UserQueryDTO, int64, error)
	GetUserByID(ctx context.Context, id uint) (*dtos.UserAuthInfo, error)
	GetUserByEmail(ctx context.Context, email string) (*dtos.UserAuthInfo, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entities.Role, error)
	GetUserBusinesses(ctx context.Context, userID uint) ([]entities.BusinessInfo, error)
	CreateUser(ctx context.Context, user entities.User) (uint, error)
	UpdateUser(ctx context.Context, id uint, user entities.User) (string, error)
	DeleteUser(ctx context.Context, id uint) (string, error)
	AssignRolesToUser(ctx context.Context, userID uint, roleIDs []uint) error
	AssignBusinessesToUser(ctx context.Context, userID uint, businessIDs []uint) error
}
