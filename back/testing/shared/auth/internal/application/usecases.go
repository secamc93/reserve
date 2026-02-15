package application

import (
	"context"
	"reserve/testing/shared/auth/internal/domain"
)

// AuthUseCases implementa los casos de uso de autenticación
type AuthUseCases struct {
	apiAdapter domain.AuthAPIPort
}

// NewAuthUseCases crea una nueva instancia de AuthUseCases
func NewAuthUseCases(apiAdapter domain.AuthAPIPort) *AuthUseCases {
	return &AuthUseCases{
		apiAdapter: apiAdapter,
	}
}

// Login realiza el login completo y devuelve toda la información
func (uc *AuthUseCases) Login(ctx context.Context, credentials domain.Credentials) (*domain.LoginResult, error) {
	if credentials.Email == "" || credentials.Password == "" {
		return nil, domain.ErrEmptyCredentials
	}

	return uc.apiAdapter.DoLogin(ctx, credentials.Email, credentials.Password)
}

// GetBusinessToken obtiene el token de negocio
// Para super admin: businessID = 0
// Para usuarios normales: businessID del negocio seleccionado
func (uc *AuthUseCases) GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error) {
	if mainToken == "" {
		return "", domain.ErrUnauthorized
	}

	return uc.apiAdapter.DoGetBusinessToken(ctx, mainToken, businessID)
}
