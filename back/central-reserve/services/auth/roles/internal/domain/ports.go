package domain

import (
	"context"
)

// IRoleRepository define las operaciones del repositorio de roles
// Esta interfaz contiene solo los métodos que se usan en los casos de uso del módulo roles
type IRoleRepository interface {
	// Métodos de roles
	CreateRole(ctx context.Context, roleDTO CreateRoleDTO) (*Role, error)
	GetRoleByID(ctx context.Context, roleID uint) (*Role, error)
	GetRoles(ctx context.Context, filters RoleFilters) ([]Role, int64, error)
	GetRolesByLevel(ctx context.Context, level int) ([]Role, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]Role, error)
	GetSystemRoles(ctx context.Context) ([]Role, error)
	RoleExistsByName(ctx context.Context, name string, excludeID *uint) (bool, error)
	UpdateRole(ctx context.Context, id uint, roleDTO UpdateRoleDTO) (*Role, error)

	// Métodos de permisos de roles
	GetRolePermissions(ctx context.Context, roleID uint) ([]Permission, error)
	AssignPermissionsToRole(ctx context.Context, roleID uint, permissionIDs []uint) error
	RemovePermissionFromRole(ctx context.Context, roleID uint, permissionID uint) error
}
