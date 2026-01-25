package secondary

import (
	"context"
	"fmt"
	"reserve/testing/modules/visit/internal/domain"
	"reserve/testing/shared"
)

// AuthAdapter implementa AuthPort usando shared.HTTPClient
type AuthAdapter struct {
	client *shared.HTTPClient
}

// NewAuthAdapter crea una nueva instancia de AuthAdapter
func NewAuthAdapter(client *shared.HTTPClient) *AuthAdapter {
	return &AuthAdapter{
		client: client,
	}
}

// GetMainToken obtiene el token principal
func (a *AuthAdapter) GetMainToken(ctx context.Context, email, password string) (string, error) {
	token, err := shared.GetMainToken(a.client, email, password)
	if err != nil {
		return "", domain.ErrAuthenticationFailed
	}
	return token, nil
}

// GetBusinessToken obtiene el token de negocio
func (a *AuthAdapter) GetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error) {
	token, err := shared.GetBusinessToken(a.client, mainToken, businessID)
	if err != nil {
		return "", domain.ErrUnauthorized
	}
	return token, nil
}

// ListBusinesses lista los negocios disponibles
func (a *AuthAdapter) ListBusinesses(ctx context.Context, token string) ([]domain.Business, error) {
	// Configurar token temporal
	oldToken := a.client.Token
	a.client.SetToken(token)
	defer a.client.SetToken(oldToken)

	resp, err := a.client.GET("/auth/verify")
	if err != nil {
		return nil, domain.ErrAPIConnection
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: HTTP %d", domain.ErrInvalidResponse, resp.StatusCode)
	}

	var response struct {
		Success bool `json:"success"`
		Data    struct {
			User struct {
				Businesses []struct {
					ID             uint   `json:"id"`
					Name           string `json:"name"`
					BusinessTypeID uint   `json:"business_type_id"`
				} `json:"businesses"`
			} `json:"user"`
		} `json:"data"`
	}

	if err := resp.ParseJSON(&response); err != nil {
		return nil, domain.ErrInvalidResponse
	}

	businesses := make([]domain.Business, len(response.Data.User.Businesses))
	for i, b := range response.Data.User.Businesses {
		businesses[i] = domain.Business{
			ID:             b.ID,
			Name:           b.Name,
			BusinessTypeID: b.BusinessTypeID,
		}
	}

	return businesses, nil
}
