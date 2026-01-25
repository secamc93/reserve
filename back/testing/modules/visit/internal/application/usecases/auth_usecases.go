package usecases

import (
	"context"
	"reserve/testing/modules/visit/internal/domain"
)

// AuthUseCases encapsula los casos de uso de autenticación
type AuthUseCases struct {
	authPort domain.AuthPort
}

// NewAuthUseCases crea una nueva instancia de AuthUseCases
func NewAuthUseCases(authPort domain.AuthPort) *AuthUseCases {
	return &AuthUseCases{
		authPort: authPort,
	}
}

// Login realiza el login y obtiene el token principal
func (uc *AuthUseCases) Login(ctx context.Context, email, password string) (string, error) {
	if email == "" || password == "" {
		return "", domain.ErrAuthenticationFailed
	}

	return uc.authPort.GetMainToken(ctx, email, password)
}

// GetBusinessToken obtiene el token de negocio
func (uc *AuthUseCases) GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error) {
	if mainToken == "" || businessID == 0 {
		return "", domain.ErrUnauthorized
	}

	return uc.authPort.GetBusinessToken(ctx, mainToken, businessID)
}

// ListBusinesses lista los negocios disponibles
func (uc *AuthUseCases) ListBusinesses(ctx context.Context, token string) ([]domain.Business, error) {
	if token == "" {
		return nil, domain.ErrUnauthorized
	}

	return uc.authPort.ListBusinesses(ctx, token)
}
