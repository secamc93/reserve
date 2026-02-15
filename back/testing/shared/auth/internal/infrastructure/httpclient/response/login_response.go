package response

// LoginAPIResponse estructura de la respuesta de la API de login
type LoginAPIResponse struct {
	Success bool `json:"success"`
	Data    struct {
		User struct {
			ID    uint   `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		} `json:"user"`
		Token      string `json:"token"`
		Businesses []struct {
			ID             uint   `json:"id"`
			Name           string `json:"name"`
			Code           string `json:"code"`
			BusinessTypeID uint   `json:"business_type_id"`
		} `json:"businesses"`
		Scope        string `json:"scope"`
		IsSuperAdmin bool   `json:"is_super_admin"`
	} `json:"data"`
}

// BusinessTokenResponse estructura de la respuesta de business token
type BusinessTokenResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Token string `json:"token"`
	} `json:"data"`
}
