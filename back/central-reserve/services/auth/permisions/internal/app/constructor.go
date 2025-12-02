package app

import (
	"central_reserve/services/auth/permisions/internal/domain"
	"central_reserve/shared/log"
	"context"
)

// Iapp define la interfaz para los casos de uso de permisos
type Iapp interface {
	GetPermissions(ctx context.Context, businessTypeID *uint, name *string, scopeID *uint) ([]domain.PermissionDTO, error)
	GetPermissionByID(ctx context.Context, id uint) (*domain.PermissionDTO, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]domain.PermissionDTO, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]domain.PermissionDTO, error)
	CreatePermission(ctx context.Context, permission domain.CreatePermissionDTO) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission domain.UpdatePermissionDTO) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
}

type PermissionUseCase struct {
	repository domain.IRepository
	logger     log.ILogger
}

// New crea una nueva instancia del caso de uso de permisos
func New(repository domain.IRepository, logger log.ILogger) Iapp {
	return &PermissionUseCase{
		repository: repository,
		logger:     logger,
	}
}
