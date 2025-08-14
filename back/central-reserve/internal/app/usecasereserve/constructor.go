package usecasereserve

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/pkg/log"
	"context"
	"time"
)

// IReserveUseCase define las operaciones para reservas
type IUseCaseReserve interface {
	CreateReserve(ctx context.Context, reserve entities.Reservation, name, email, phone string, dni string) (*dtos.ReserveDetailDTO, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]dtos.ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*dtos.ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, params dtos.UpdateReservationDTO) (string, error)
}

type ReserveUseCase struct {
	repository   ports.IReservationRepository
	emailService ports.IEmailService
	log          log.ILogger
}

func NewReserveUseCase(repository ports.IReservationRepository, emailService ports.IEmailService, log log.ILogger) *ReserveUseCase {
	return &ReserveUseCase{
		repository:   repository,
		emailService: emailService,
		log:          log,
	}
}
