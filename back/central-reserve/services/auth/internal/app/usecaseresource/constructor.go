package usecaseresource

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"context"
)

// IUseCaseResource define la interfaz para los casos de uso de recursos
type IUseCaseResource interface {
	GetResources(ctx context.Context, filters domain.ResourceFilters) (*domain.ResourceListDTO, error)
	GetResourceByID(ctx context.Context, id uint) (*domain.ResourceDTO, error)
	CreateResource(ctx context.Context, resource domain.CreateResourceDTO) (*domain.ResourceDTO, error)
	UpdateResource(ctx context.Context, id uint, resource domain.UpdateResourceDTO) (*domain.ResourceDTO, error)
	DeleteResource(ctx context.Context, id uint) (string, error)
}

type ResourceUseCase struct {
	repository domain.IAuthRepository
	logger     log.ILogger
}

// New crea una nueva instancia del caso de uso de recursos
func New(repository domain.IAuthRepository, logger log.ILogger) IUseCaseResource {
	return &ResourceUseCase{
		repository: repository,
		logger:     logger,
	}
}
