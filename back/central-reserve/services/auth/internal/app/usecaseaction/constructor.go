package usecaseaction

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/shared/log"
	"context"
)

// IUseCaseAction define la interfaz para los casos de uso de actions
type IUseCaseAction interface {
	GetActions(ctx context.Context, page, pageSize int, name string) (*domain.ActionListDTO, error)
	GetActionByID(ctx context.Context, id uint) (*domain.ActionDTO, error)
	CreateAction(ctx context.Context, action domain.CreateActionDTO) (*domain.ActionDTO, error)
	UpdateAction(ctx context.Context, id uint, action domain.UpdateActionDTO) (*domain.ActionDTO, error)
	DeleteAction(ctx context.Context, id uint) (string, error)
}

type ActionUseCase struct {
	repository domain.IAuthRepository
	logger     log.ILogger
}

// New crea una nueva instancia del caso de uso de actions
func New(repository domain.IAuthRepository, logger log.ILogger) IUseCaseAction {
	return &ActionUseCase{
		repository: repository,
		logger:     logger,
	}
}
