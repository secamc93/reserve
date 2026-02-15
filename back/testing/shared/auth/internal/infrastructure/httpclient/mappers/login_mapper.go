package mappers

import (
	"reserve/testing/shared/auth/internal/domain"
	"reserve/testing/shared/auth/internal/infrastructure/httpclient/response"
)

// LoginResponseToDomain convierte la respuesta de la API a entidad de dominio
func LoginResponseToDomain(resp *response.LoginAPIResponse) *domain.LoginResult {
	businesses := make([]domain.Business, len(resp.Data.Businesses))
	for i, b := range resp.Data.Businesses {
		businesses[i] = domain.Business{
			ID:             b.ID,
			Name:           b.Name,
			Code:           b.Code,
			BusinessTypeID: b.BusinessTypeID,
		}
	}

	return &domain.LoginResult{
		Token: resp.Data.Token,
		User: domain.User{
			ID:    resp.Data.User.ID,
			Email: resp.Data.User.Email,
			Name:  resp.Data.User.Name,
		},
		Businesses:   businesses,
		Scope:        resp.Data.Scope,
		IsSuperAdmin: resp.Data.IsSuperAdmin,
	}
}

// BusinessTokenResponseToString extrae el token de la respuesta
func BusinessTokenResponseToString(resp *response.BusinessTokenResponse) string {
	return resp.Data.Token
}
