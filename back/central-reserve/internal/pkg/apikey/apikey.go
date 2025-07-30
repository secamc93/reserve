package apikey

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// Service maneja la generación y validación de API Keys
type Service struct{}

// NewService crea una nueva instancia del servicio de API Keys
func NewService() *Service {
	return &Service{}
}

// GenerateAPIKey genera una API Key segura
func (s *Service) GenerateAPIKey() (string, error) {
	// Generar 32 bytes aleatorios
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("error al generar bytes aleatorios: %w", err)
	}

	// Convertir a hexadecimal
	apiKey := hex.EncodeToString(bytes)

	// Agregar prefijo para identificar que es una API Key
	apiKey = "ak_" + apiKey

	return apiKey, nil
}

// HashAPIKey genera el hash de una API Key usando bcrypt
func (s *Service) HashAPIKey(apiKey string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(apiKey), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("error al hashear API Key: %w", err)
	}
	return string(hash), nil
}

// ValidateAPIKey valida una API Key contra su hash
func (s *Service) ValidateAPIKey(apiKey, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(apiKey))
	return err == nil
}

// IsValidAPIKeyFormat verifica si el formato de la API Key es válido
func (s *Service) IsValidAPIKeyFormat(apiKey string) bool {
	// Verificar que tenga el prefijo correcto
	if !strings.HasPrefix(apiKey, "ak_") {
		return false
	}

	// Verificar que tenga la longitud correcta (prefijo + 64 caracteres hex)
	if len(apiKey) != 67 { // "ak_" + 64 caracteres hex
		return false
	}

	// Verificar que los caracteres después del prefijo sean hexadecimales
	hexPart := apiKey[3:] // Remover "ak_"
	for _, char := range hexPart {
		if !((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F')) {
			return false
		}
	}

	return true
}
