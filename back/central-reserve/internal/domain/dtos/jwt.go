package dtos

type JWTClaims struct {
	UserID     uint
	Email      string
	Roles      []string
	BusinessID uint
}
