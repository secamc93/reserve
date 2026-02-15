package auth

import (
	"context"
	"reserve/testing/shared/auth/internal/application"
	"reserve/testing/shared/auth/internal/domain"
	"reserve/testing/shared/auth/internal/infrastructure/httpclient"
	"reserve/testing/shared/client"
)

// Re-exportar tipos del dominio para uso externo
type (
	LoginResult = domain.LoginResult
	User        = domain.User
	Business    = domain.Business
	Credentials = domain.Credentials
)

// Re-exportar errores del dominio
var (
	ErrInvalidCredentials  = domain.ErrInvalidCredentials
	ErrEmptyCredentials    = domain.ErrEmptyCredentials
	ErrAPIConnection       = domain.ErrAPIConnection
	ErrInvalidResponse     = domain.ErrInvalidResponse
	ErrUnauthorized        = domain.ErrUnauthorized
	ErrBusinessTokenFailed = domain.ErrBusinessTokenFailed
)

// Service es el servicio de autenticación con arquitectura hexagonal
type Service struct {
	useCases *application.AuthUseCases
}

// New crea una nueva instancia del servicio de autenticación
// Recibe el cliente HTTP de shared/client
func New(httpClient client.IClient) *Service {
	// Crear el adapter HTTP de infraestructura
	httpAdapter := httpclient.NewHTTPAdapter(httpClient)

	// Crear los casos de uso
	useCases := application.NewAuthUseCases(httpAdapter)

	return &Service{
		useCases: useCases,
	}
}

// Login realiza el login completo y devuelve toda la información
// incluyendo token, businesses, scope y si es super admin
func (s *Service) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	return s.useCases.Login(ctx, Credentials{
		Email:    email,
		Password: password,
	})
}

// GetBusinessToken obtiene el token de negocio
// Para super admin: usar businessID = 0
// Para usuarios normales: usar el businessID del negocio seleccionado
func (s *Service) GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error) {
	return s.useCases.GetBusinessToken(ctx, mainToken, businessID)
}
