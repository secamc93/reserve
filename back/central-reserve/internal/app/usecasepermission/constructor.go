package usecasepermission

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

// PermissionUseCase implementa los casos de uso para permisos
type IUseCasePermission interface {
	GetPermissions(ctx context.Context) ([]dtos.PermissionDTO, error)
	GetPermissionByID(ctx context.Context, id uint) (*dtos.PermissionDTO, error)
	CreatePermission(ctx context.Context, permission dtos.CreatePermissionDTO) (string, error)
	UpdatePermission(ctx context.Context, id uint, permission dtos.UpdatePermissionDTO) (string, error)
	DeletePermission(ctx context.Context, id uint) (string, error)
	GetPermissionsByResource(ctx context.Context, resource string) ([]dtos.PermissionDTO, error)
	GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]dtos.PermissionDTO, error)
}

type PermissionUseCase struct {
	repository ports.IPermissionRepository
	logger     log.ILogger
}

// NewPermissionUseCase crea una nueva instancia del caso de uso de permisos
func NewPermissionUseCase(repository ports.IPermissionRepository, logger log.ILogger) IUseCasePermission {
	return &PermissionUseCase{
		repository: repository,
		logger:     logger,
	}
}
