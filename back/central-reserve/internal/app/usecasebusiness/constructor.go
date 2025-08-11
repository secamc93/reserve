package usecasebusiness

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/env"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseBusiness interface {
	GetBusinesses(ctx context.Context) ([]dtos.BusinessResponse, error)
	GetBusinessByID(ctx context.Context, id uint) (*dtos.BusinessResponse, error)
	CreateBusiness(ctx context.Context, request dtos.BusinessRequest) (*dtos.BusinessResponse, error)
	UpdateBusiness(ctx context.Context, id uint, request dtos.UpdateBusinessRequest) (*dtos.BusinessResponse, error)
	DeleteBusiness(ctx context.Context, id uint) error
}

type BusinessUseCase struct {
	repository ports.IBusinessRepository
	log        log.ILogger
	s3         ports.IS3Service
	env        env.IConfig
}

func NewBusinessUseCase(repository ports.IBusinessRepository, log log.ILogger, s3 ports.IS3Service, env env.IConfig) IUseCaseBusiness {
	return &BusinessUseCase{
		repository: repository,
		log:        log,
		s3:         s3,
		env:        env,
	}
}
