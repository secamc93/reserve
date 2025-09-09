package usecaserole

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseRole interface {
	GetRoles(ctx context.Context) ([]domain.RoleDTO, error)
	GetRoleByID(ctx context.Context, id uint) (*domain.RoleDTO, error)
	GetRolesByLevel(ctx context.Context, filters domain.RoleFilters) ([]domain.RoleDTO, error)
	GetRolesByScopeID(ctx context.Context, scopeID uint) ([]domain.RoleDTO, error)
	GetSystemRoles(ctx context.Context) ([]domain.RoleDTO, error)
}

// RoleUseCase implementa los casos de uso para roles
type RoleUseCase struct {
	repository domain.IAuthRepository
	log        log.ILogger
}

// NewRoleUseCase crea una nueva instancia del caso de uso de roles
func New(repository domain.IAuthRepository, log log.ILogger) IUseCaseRole {
	return &RoleUseCase{
		repository: repository,
		log:        log,
	}
}
