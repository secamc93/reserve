package domain

import (
	"context"
)

// IRepository define las operaciones del repositorio del módulo permisions
// Esta interfaz contiene solo los métodos de permisos que se usan en los casos de uso del módulo
type IRepository interface {
	// Métodos de permisos
	GetPermissions(ctx context.Context, businessTypeID *uint, name *string, scopeID *uint) ([]Permission, error)
	GetPermissionByID(ctx context.Context, id uint) (*Permission, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]Permission, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]Permission, error)
	PermissionExistsByName(ctx context.Context, name string) (bool, error)
	CreatePermission(ctx context.Context, permission Permission) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission Permission) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)

	// Métodos auxiliares
	GetBusinessTypeByID(ctx context.Context, businessTypeID uint) (*BusinessTypeInfo, error)
}
