package middleware

type JWTClaims struct {
	UserID    uint
	TokenType string
}
type BusinessTokenClaims struct {
	UserID         uint
	BusinessID     uint
	BusinessTypeID uint
	RoleID         uint
	TokenType      string
}

type ValidateAPIKeyRequest struct {
	APIKey string
}
