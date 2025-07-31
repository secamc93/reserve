package ports

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
)

// IEmailService define las operaciones de envío de emails
type IEmailService interface {
	SendReservationConfirmation(ctx context.Context, email, name string, reservation entities.Reservation) error
	SendReservationCancellation(ctx context.Context, email, name string, reservation entities.Reservation) error
}

// IJWTService define las operaciones de JWT
type IJWTService interface {
	GenerateToken(userID uint, email string, roles []string, businessID uint) (string, error)
	ValidateToken(tokenString string) (*dtos.JWTClaims, error)
	RefreshToken(tokenString string) (string, error)
}
