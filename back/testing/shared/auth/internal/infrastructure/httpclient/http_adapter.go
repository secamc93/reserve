package httpclient

import (
	"context"
	"fmt"

	"reserve/testing/shared/auth/internal/domain"
	"reserve/testing/shared/auth/internal/infrastructure/httpclient/mappers"
	"reserve/testing/shared/auth/internal/infrastructure/httpclient/request"
	"reserve/testing/shared/auth/internal/infrastructure/httpclient/response"
	"reserve/testing/shared/client"
)

// HTTPAdapter implementa AuthAPIPort usando el cliente HTTP de shared/client
type HTTPAdapter struct {
	client client.IClient
}

// NewHTTPAdapter crea una nueva instancia de HTTPAdapter
func NewHTTPAdapter(httpClient client.IClient) *HTTPAdapter {
	return &HTTPAdapter{
		client: httpClient,
	}
}

// DoLogin realiza la petición de login a la API
func (a *HTTPAdapter) DoLogin(ctx context.Context, email, password string) (*domain.LoginResult, error) {
	req := request.LoginRequest{
		Email:    email,
		Password: password,
	}

	resp, err := a.client.POST("/auth/login", req)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", domain.ErrAPIConnection, err)
	}

	if resp.GetStatusCode() != 200 {
		return nil, fmt.Errorf("%w: HTTP %d - %s", domain.ErrInvalidCredentials, resp.GetStatusCode(), string(resp.GetBody()))
	}

	var loginResp response.LoginAPIResponse
	if err := resp.ParseJSON(&loginResp); err != nil {
		return nil, fmt.Errorf("%w: %v", domain.ErrInvalidResponse, err)
	}

	if !loginResp.Success {
		return nil, domain.ErrInvalidCredentials
	}

	return mappers.LoginResponseToDomain(&loginResp), nil
}

// DoGetBusinessToken obtiene el business token de la API
func (a *HTTPAdapter) DoGetBusinessToken(ctx context.Context, mainToken string, businessID uint) (string, error) {
	// Guardar token anterior y restaurar al final
	previousToken := a.client.GetToken()
	a.client.SetToken(mainToken)
	defer a.client.SetToken(previousToken)

	req := request.BusinessTokenRequest{
		BusinessID: businessID,
	}

	resp, err := a.client.POST("/auth/business-token", req)
	if err != nil {
		return "", fmt.Errorf("%w: %v", domain.ErrAPIConnection, err)
	}

	if resp.GetStatusCode() != 200 {
		return "", fmt.Errorf("%w: HTTP %d - %s", domain.ErrBusinessTokenFailed, resp.GetStatusCode(), string(resp.GetBody()))
	}

	var tokenResp response.BusinessTokenResponse
	if err := resp.ParseJSON(&tokenResp); err != nil {
		return "", fmt.Errorf("%w: %v", domain.ErrInvalidResponse, err)
	}

	if !tokenResp.Success {
		return "", domain.ErrBusinessTokenFailed
	}

	return mappers.BusinessTokenResponseToString(&tokenResp), nil
}
