package entities

import "time"

// APIKey representa una clave de API en el dominio
type APIKey struct {
	ID          uint       `json:"id"`
	UserID      uint       `json:"user_id"`
	BusinessID  uint       `json:"business_id"`
	CreatedByID uint       `json:"created_by_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	KeyHash     string     `json:"-"` // No se serializa en JSON por seguridad
	LastUsedAt  *time.Time `json:"last_used_at"`
	Revoked     bool       `json:"revoked"`
	RevokedAt   *time.Time `json:"revoked_at"`
	RateLimit   int        `json:"rate_limit"`
	IPWhitelist string     `json:"ip_whitelist"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// APIKeyInfo representa información básica de una API Key para respuestas
type APIKeyInfo struct {
	ID          uint
	UserID      uint
	BusinessID  uint
	Name        string
	Description string
	LastUsedAt  *time.Time
	Revoked     bool
	RateLimit   int
	CreatedAt   time.Time
}
