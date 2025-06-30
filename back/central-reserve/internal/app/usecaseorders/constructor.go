package usecaseorders

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/pkg/log"
	"context"
)

type IUseCaseHolaMundo interface {
	HolaMundo(ctx context.Context) (string, error)
	CreateReserve(ctx context.Context, reserve domain.Reservation) (string, error)
}

type OrderUseCase struct {
	holaMundo domain.IHolaMundo
	log       log.ILogger
}

func NewOrderUseCase(holaMundo domain.IHolaMundo, log log.ILogger) IUseCaseHolaMundo {
	return &OrderUseCase{
		holaMundo: holaMundo,
		log:       log,
	}
}

func (u *OrderUseCase) HolaMundo(ctx context.Context) (string, error) {
	return u.holaMundo.HolaMundo(), nil
}

func (u *OrderUseCase) CreateReserve(ctx context.Context, reserve domain.Reservation) (string, error) {
	response, err := u.holaMundo.CreateReserve(ctx, reserve)
	if err != nil {
		return "", err
	}
	return response, nil
}
