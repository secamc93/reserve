package request

// LoginRequest estructura para la petición de login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// BusinessTokenRequest estructura para la petición de business token
type BusinessTokenRequest struct {
	BusinessID uint `json:"business_id"`
}
