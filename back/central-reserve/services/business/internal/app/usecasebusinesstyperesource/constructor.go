package usecasebusinesstyperesource

import (
	"context"

	"central_reserve/services/business/internal/domain"
	"central_reserve/shared/log"
)

type IUseCaseBusinessTypeResource interface {
	GetBusinessTypeResources(ctx context.Context, businessTypeID uint) (*domain.BusinessTypeResourcesResponse, error)
	UpdateBusinessTypeResources(ctx context.Context, businessTypeID uint, request domain.UpdateBusinessTypeResourcesRequest) error
	GetBusinessTypesWithResourcesPaginated(ctx context.Context, page, perPage int, businessTypeID *uint) (*domain.BusinessTypesWithResourcesPaginatedResponse, error)

	// Métodos para recursos configurados del business
	GetBusinessesWithConfiguredResourcesPaginated(ctx context.Context, page, perPage int, businessID *uint) (*domain.BusinessesWithConfiguredResourcesPaginatedResponse, error)
	UpdateBusinessConfiguredResources(ctx context.Context, businessID uint, request domain.UpdateBusinessTypeResourcesRequest) error
}

type businessTypeResourceUseCase struct {
	businessRepository domain.IBusinessRepository
	log                log.ILogger
}

func New(businessRepository domain.IBusinessRepository, log log.ILogger) IUseCaseBusinessTypeResource {
	return &businessTypeResourceUseCase{
		businessRepository: businessRepository,
		log:                log,
	}
}
