package domain

import (
	"context"
	"time"
)

// IReservationRepository define las operaciones para reservas
type IReservationRepository interface {
	CreateReserve(ctx context.Context, reserve Reservation) (uint, error)
	GetLatestReservationByClient(ctx context.Context, clientID uint) (*Reservation, error)
	GetReserves(ctx context.Context, statusID *uint, clientID *uint, tableID *uint, startDate *time.Time, endDate *time.Time) ([]ReserveDetailDTO, error)
	GetReserveByID(ctx context.Context, id uint) (*ReserveDetailDTO, error)
	CancelReservation(ctx context.Context, id uint, reason string) (string, error)
	UpdateReservation(ctx context.Context, params UpdateReservationDTO) (string, error)
	CreateReservationStatusHistory(ctx context.Context, history ReservationStatusHistory) error
	GetClientByEmailAndBusiness(ctx context.Context, email string, businessID uint) (*Client, error)
	CreateClient(ctx context.Context, client Client) (string, error)
	GetReservationStatuses(ctx context.Context) ([]ReservationStatus, error)
}
type IEmailService interface {
	SendHTML(ctx context.Context, to, subject, html string) error
}
