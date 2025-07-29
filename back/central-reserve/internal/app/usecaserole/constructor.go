package usecaserole

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseRole interface {
	GetRoles(ctx context.Context) ([]dtos.RoleDTO, error)
	GetRoleByID(ctx context.Context, id uint) (*dtos.RoleDTO, error)
	GetRolesByLevel(ctx context.Context, filters dtos.RoleFilters) ([]dtos.RoleDTO, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]dtos.RoleDTO, error)
	GetSystemRoles(ctx context.Context) ([]dtos.RoleDTO, error)
}

// RoleUseCase implementa los casos de uso para roles
type RoleUseCase struct {
	repository ports.IRoleRepository
	log        log.ILogger
}

// NewRoleUseCase crea una nueva instancia del caso de uso de roles
func NewRoleUseCase(repository ports.IRoleRepository, log log.ILogger) IUseCaseRole {
	return &RoleUseCase{
		repository: repository,
		log:        log,
	}
}
