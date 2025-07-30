package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
	secretKey string
}

type Claims struct {
	UserID uint     `json:"user_id"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

func New(secretKey string) *JWTService {
	return &JWTService{
		secretKey: secretKey,
	}
}

// GenerateToken genera un token JWT con la información del usuario
func (j *JWTService) GenerateToken(userID uint, email string, roles []string) (string, error) {
	// Configurar claims
	claims := Claims{
		UserID: userID,
		Email:  email,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token válido por 24 horas
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "central-reserve-api",
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	// Crear token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar token
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("error al firmar token: %w", err)
	}

	return tokenString, nil
}

// GenerateAPIKey genera una API Key segura usando JWT
func (j *JWTService) GenerateAPIKey(apiKeyID string, description string, roles []string, expiresIn time.Duration) (string, error) {
	// Configurar claims para API Key
	claims := Claims{
		UserID: 0, // API Key no tiene usuario específico
		Email:  fmt.Sprintf("api-%s@system.com", apiKeyID),
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "central-reserve-api",
			Subject:   apiKeyID, // Usar el API Key ID como subject
		},
	}

	// Crear token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar token
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("error al firmar API Key: %w", err)
	}

	return tokenString, nil
}

// GenerateUserAPIKey genera una API Key para un usuario específico sin expiración
func (j *JWTService) GenerateUserAPIKey(userID uint, userEmail string, businessID uint, description string, roles []string) (string, error) {
	// Configurar claims para API Key de usuario
	claims := Claims{
		UserID: userID,
		Email:  userEmail,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			// No establecer ExpiresAt para que no expire
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "central-reserve-api",
			Subject:   fmt.Sprintf("user-%d-business-%d", userID, businessID),
		},
	}

	// Crear token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar token
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("error al firmar API Key de usuario: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida un token JWT y retorna los claims
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verificar el método de firma
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error al parsear token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("token inválido")
}

// RefreshToken genera un nuevo token con la misma información pero nueva expiración
func (j *JWTService) RefreshToken(tokenString string) (string, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// Generar nuevo token con nueva expiración
	return j.GenerateToken(claims.UserID, claims.Email, claims.Roles)
}
