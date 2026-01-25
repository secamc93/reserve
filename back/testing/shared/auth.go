package shared

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
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

// BusinessTokenRequest estructura para solicitar business token
type BusinessTokenRequest struct {
	BusinessID uint `json:"business_id"`
}

// BusinessTokenResponse estructura de respuesta
type BusinessTokenResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Token string `json:"token"`
	} `json:"data"`
}

// GetMainToken realiza login y obtiene el token principal
func GetMainToken(client *HTTPClient, email, password string) (string, error) {
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

	var loginResp struct {
		Success bool `json:"success"`
		Data    LoginResponse `json:"data"`
	}

	if err := resp.ParseJSON(&loginResp); err != nil {
		return "", fmt.Errorf("error parseando respuesta de login: %w", err)
	}

	return loginResp.Data.Token, nil
}

// GetBusinessToken obtiene el business token usando el main token
func GetBusinessToken(client *HTTPClient, mainToken string, businessID uint) (string, error) {
	previousToken := client.Token
	client.SetToken(mainToken)
	defer client.SetToken(previousToken)

	bizTokenReq := BusinessTokenRequest{
		BusinessID: businessID,
	}

	resp, err := client.POST("/auth/business-token", bizTokenReq)
	if err != nil {
		return "", fmt.Errorf("error obteniendo business token: %w", err)
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("business token falló con status %d: %s", resp.StatusCode, string(resp.Body))
	}

	var bizTokenResp BusinessTokenResponse
	if err := resp.ParseJSON(&bizTokenResp); err != nil {
		return "", fmt.Errorf("error parseando business token response: %w", err)
	}

	return bizTokenResp.Data.Token, nil
}

// SelectUser muestra lista de usuarios y permite seleccionar uno
func SelectUser() (*UserConfig, error) {
	users := GetAvailableUsers()

	if len(users) == 0 {
		return nil, fmt.Errorf("no hay usuarios configurados en .env")
	}

	fmt.Println("\n👤 Usuarios disponibles:")
	fmt.Println("========================")
	for _, user := range users {
		displayName := user.Name
		if displayName == "" {
			displayName = user.Email
		}
		fmt.Printf("%d. %s (%s)\n", user.Number, displayName, user.Email)
	}

	fmt.Print("\nSeleccione usuario (1-3): ")
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	selection, err := strconv.Atoi(input)
	if err != nil || selection < 1 || selection > len(users) {
		return nil, fmt.Errorf("selección inválida")
	}

	return &users[selection-1], nil
}

