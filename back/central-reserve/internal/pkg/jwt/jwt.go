package jwt

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/ports"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
	secretKey string
}

// Claims representa los claims del JWT (implementación interna)
type Claims struct {
	UserID     uint     `json:"user_id"`
	Email      string   `json:"email"`
	Roles      []string `json:"roles"`
	BusinessID uint     `json:"business_id"`
	jwt.RegisteredClaims
}

// New crea una nueva instancia del servicio JWT
func New(secretKey string) ports.IJWTService {
	return &JWTService{
		secretKey: secretKey,
	}
}

// GenerateToken genera un nuevo token JWT
func (j *JWTService) GenerateToken(userID uint, email string, roles []string, businessID uint) (string, error) {
	claims := Claims{
		UserID:     userID,
		Email:      email,
		Roles:      roles,
		BusinessID: businessID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "central-reserve-api",
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("error al firmar token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida y decodifica un token JWT
func (j *JWTService) ValidateToken(tokenString string) (*dtos.JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error al parsear token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Convertir a la estructura del dominio
		return &dtos.JWTClaims{
			UserID:     claims.UserID,
			Email:      claims.Email,
			Roles:      claims.Roles,
			BusinessID: claims.BusinessID,
		}, nil
	}

	return nil, fmt.Errorf("token inválido")
}

// RefreshToken refresca un token JWT
func (j *JWTService) RefreshToken(tokenString string) (string, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	return j.GenerateToken(claims.UserID, claims.Email, claims.Roles, claims.BusinessID)
}
