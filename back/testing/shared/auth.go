package helpers

import (
	"fmt"
	"os"
)

// LoginRequest representa la petición de login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse representa la respuesta del login
type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    uint   `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"user"`
}

// GetAuthToken obtiene un token JWT para testing
func GetAuthToken(client *HTTPClient) (string, error) {
	// Intentar obtener credenciales desde variables de entorno
	email := os.Getenv("TEST_USER_EMAIL")
	password := os.Getenv("TEST_USER_PASSWORD")

	if email == "" || password == "" {
		// Valores por defecto para testing local
		email = "admin@test.com"
		password = "admin123"
	}

	loginReq := LoginRequest{
		Email:    email,
		Password: password,
	}

	resp, err := client.POST("/auth/login", loginReq)
	if err != nil {
		return "", fmt.Errorf("error en petición de login: %w", err)
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("login falló con status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var loginResp LoginResponse
	if err := resp.ParseJSON(&loginResp); err != nil {
		return "", fmt.Errorf("error parseando respuesta de login: %w", err)
	}

	return loginResp.Token, nil
}
