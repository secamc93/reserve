package usecaserole

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
)

// RoleUseCase implementa los casos de uso para roles
type RoleUseCase struct {
	repository ports.IRoleUseCaseRepository
	log        log.ILogger
}

// NewRoleUseCase crea una nueva instancia del caso de uso de roles
func NewRoleUseCase(repository ports.IRoleUseCaseRepository, log log.ILogger) *RoleUseCase {
	return &RoleUseCase{
		repository: repository,
		log:        log,
	}
}
