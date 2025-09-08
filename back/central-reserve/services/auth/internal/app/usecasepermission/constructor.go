package usecasepermission

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"context"
)

// PermissionUseCase implementa los casos de uso para permisos
type IUseCasePermission interface {
	GetPermissions(ctx context.Context) ([]domain.PermissionDTO, error)
	GetPermissionByID(ctx context.Context, id uint) (*domain.PermissionDTO, error)
	CreatePermission(ctx context.Context, permission domain.CreatePermissionDTO) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission domain.UpdatePermissionDTO) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]domain.PermissionDTO, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]domain.PermissionDTO, error)
}

type PermissionUseCase struct {
	repository domain.IPermissionRepository
	logger     log.ILogger
}

// NewPermissionUseCase crea una nueva instancia del caso de uso de permisos
func NewPermissionUseCase(repository domain.IPermissionRepository, logger log.ILogger) IUseCasePermission {
	return &PermissionUseCase{
		repository: repository,
		logger:     logger,
	}
}
