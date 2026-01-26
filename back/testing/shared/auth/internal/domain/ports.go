package domain

import "context"

// AuthPort define las operaciones de autenticación (puerto primario)
type AuthPort interface {
	// Login realiza el login y devuelve toda la información necesaria
	Login(ctx context.Context, credentials Credentials) (*LoginResult, error)

	// GetBusinessToken obtiene el token de negocio usando el main token
	GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error)
}

// AuthAPIPort define las operaciones hacia la API externa (puerto secundario)
type AuthAPIPort interface {
	// DoLogin realiza la petición de login a la API
	DoLogin(ctx context.Context, email, password string) (*LoginResult, error)

	// DoGetBusinessToken obtiene el business token de la API
	DoGetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error)
}
