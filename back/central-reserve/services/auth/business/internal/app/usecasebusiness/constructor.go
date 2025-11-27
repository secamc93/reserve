package usecasebusiness

import (
	"central_reserve/services/business/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseBusiness interface {
	GetBusinesses(ctx context.Context, page, perPage int, name string, businessTypeID *uint, isActive *bool) ([]domain.BusinessResponse, int64, error)
	GetBusinessByID(ctx context.Context, id uint) (*domain.BusinessResponse, error)
	CreateBusiness(ctx context.Context, request domain.BusinessRequest) (*domain.BusinessResponse, error)
	UpdateBusiness(ctx context.Context, id uint, request domain.UpdateBusinessRequest) (*domain.BusinessResponse, error)
	DeleteBusiness(ctx context.Context, id uint) error
	GetBusinessesConfiguredResources(ctx context.Context, page, perPage int, businessID *uint, businessTypeID *uint) ([]domain.BusinessWithConfiguredResourcesResponse, int64, error)
	GetBusinessConfiguredResourcesByID(ctx context.Context, businessID uint) (*domain.BusinessWithConfiguredResourcesResponse, error)
	ToggleBusinessResourceActive(ctx context.Context, businessID uint, resourceID uint, active bool) error
}

type BusinessUseCase struct {
	repository domain.IBusinessRepository
	log        log.ILogger
	s3         domain.IS3Service
	env        env.IConfig
}

func New(repository domain.IBusinessRepository, log log.ILogger, s3 domain.IS3Service, env env.IConfig) IUseCaseBusiness {
	return &BusinessUseCase{
		repository: repository,
		log:        log,
		s3:         s3,
		env:        env,
	}
}
