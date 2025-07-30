package usecasebusinesstype

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseBusinessType interface {
	GetBusinessTypes(ctx context.Context) ([]dtos.BusinessTypeResponse, error)
	GetBusinessTypeByID(ctx context.Context, id uint) (*dtos.BusinessTypeResponse, error)
	CreateBusinessType(ctx context.Context, request dtos.BusinessTypeRequest) (*dtos.BusinessTypeResponse, error)
	UpdateBusinessType(ctx context.Context, id uint, request dtos.BusinessTypeRequest) (*dtos.BusinessTypeResponse, error)
	DeleteBusinessType(ctx context.Context, id uint) error
}

type BusinessTypeUseCase struct {
	repository ports.IBusinessTypeRepository
	log        log.ILogger
}

func NewBusinessTypeUseCase(repository ports.IBusinessTypeRepository, log log.ILogger) IUseCaseBusinessType {
	return &BusinessTypeUseCase{
		repository: repository,
		log:        log,
	}
}
