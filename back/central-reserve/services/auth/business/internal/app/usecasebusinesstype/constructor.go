package usecasebusinesstype

import (
	"central_reserve/services/business/internal/domain"
	"central_reserve/shared/log"
	"context"
)

type IUseCaseBusinessType interface {
	GetBusinessTypes(ctx context.Context) ([]domain.BusinessTypeResponse, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*domain.BusinessTypeResponse, error)
	CreateBusinessType(ctx context.Context, request domain.BusinessTypeRequest) (*domain.BusinessTypeResponse, error)
	UpdateBusinessType(ctx context.Context, id uint, request domain.BusinessTypeRequest) (*domain.BusinessTypeResponse, error)
	DeleteBusinessType(ctx context.Context, id uint) error
}

type BusinessTypeUseCase struct {
	repository domain.IBusinessRepository
	log        log.ILogger
}

func New(repository domain.IBusinessRepository, log log.ILogger) IUseCaseBusinessType {
	return &BusinessTypeUseCase{
		repository: repository,
		log:        log,
	}
}
