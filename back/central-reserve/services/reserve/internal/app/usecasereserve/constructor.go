package usecasereserve

import (
	"central_reserve/services/reserve/internal/domain"
	"central_reserve/shared/email"
	"central_reserve/shared/log"
	"context"
	"time"
)

// IReserveUseCase define las operaciones para reservas
type IUseCaseReserve interface {
	CreateReserve(ctx context.Context, reserve domain.Reservation, name, email, phone string, dni string) (*domain.ReserveDetailDTO, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]domain.ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*domain.ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, params domain.UpdateReservationDTO) (string, error)
	GetReservationStatuses(ctx context.Context) ([]domain.ReservationStatusDTO, error)
}

type ReserveUseCase struct {
	repository domain.IReservationRepository
	sender     email.IEmailService
	log        log.ILogger
}

func New(repository domain.IReservationRepository, sender domain.IEmailService, log log.ILogger) *ReserveUseCase {
	return &ReserveUseCase{
		repository: repository,
		sender:     sender,
		log:        log,
	}
}
