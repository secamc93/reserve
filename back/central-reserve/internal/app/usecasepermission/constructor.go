package usecasepermission

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
)

// PermissionUseCase implementa los casos de uso para permisos
type PermissionUseCase struct {
	repository ports.IPermissionUseCaseRepository
	logger     log.ILogger
}

// NewPermissionUseCase crea una nueva instancia del caso de uso de permisos
func NewPermissionUseCase(repository ports.IPermissionUseCaseRepository, logger log.ILogger) ports.IPermissionUseCase {
	return &PermissionUseCase{
		repository: repository,
		logger:     logger,
	}
}
