package ports

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"mime/multipart"
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

// IS3Service define las operaciones de almacenamiento en S3
type IS3Service interface {
	UploadImage(ctx context.Context, file *multipart.FileHeader, folder string) (string, error) // Retorna path relativo
	GetImageURL(filename string) string                                                         // Genera URL completa
	DeleteImage(ctx context.Context, filename string) error
	ImageExists(ctx context.Context, filename string) (bool, error)
}
