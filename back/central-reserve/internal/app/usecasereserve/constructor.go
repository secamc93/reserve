package usecasereserve

import (
	"central_reserve/internal/domain"
	"central_reserve/internal/pkg/log"
	"context"
	"time"
)

type IUseCaseReserve interface {
	HolaMundo(ctx context.Context) (string, error)
	CreateReserve(ctx context.Context, reserve domain.Reservation, name, email, phone string, dni uint) (string, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]domain.ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*domain.ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, id uint, tableID *uint, startAt *time.Time, endAt *time.Time, numberOfGuests *int) (string, error)
}

type ReserveUseCase struct {
	repository domain.IHolaMundo
	log        log.ILogger
}

func NewReserveUseCase(repository domain.IHolaMundo, log log.ILogger) IUseCaseReserve {
	return &ReserveUseCase{
		repository: repository,
		log:        log,
	}
}
