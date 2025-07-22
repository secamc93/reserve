package response

import "time"

// RoleInfo representa información de un rol en la respuesta de usuario
type RoleInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Level       int    `json:"level"`
	IsSystem    bool   `json:"is_system"`
	ScopeID     uint   `json:"scope_id"`
	ScopeName   string `json:"scope_name"`
	ScopeCode   string `json:"scope_code"`
}

// BusinessInfo representa información de un business en la respuesta de usuario
type BusinessInfo struct {
	ID                 uint   `json:"id"`
	Name               string `json:"name"`
	Code               string `json:"code"`
	BusinessTypeID     uint   `json:"business_type_id"`
	Timezone           string `json:"timezone"`
	Address            string `json:"address"`
	Description        string `json:"description"`
	LogoURL            string `json:"logo_url"`
	PrimaryColor       string `json:"primary_color"`
	SecondaryColor     string `json:"secondary_color"`
	CustomDomain       string `json:"custom_domain"`
	IsActive           bool   `json:"is_active"`
	EnableDelivery     bool   `json:"enable_delivery"`
	EnablePickup       bool   `json:"enable_pickup"`
	EnableReservations bool   `json:"enable_reservations"`
	BusinessTypeName   string `json:"business_type_name"`
	BusinessTypeCode   string `json:"business_type_code"`
}

// UserResponse representa la respuesta de un usuario
type UserResponse struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Email       string         `json:"email"`
	Phone       string         `json:"phone"`
	AvatarURL   string         `json:"avatar_url"`
	IsActive    bool           `json:"is_active"`
	LastLoginAt *time.Time     `json:"last_login_at"`
	Roles       []RoleInfo     `json:"roles"`
	Businesses  []BusinessInfo `json:"businesses"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// UserListResponse representa la respuesta de una lista de usuarios
type UserListResponse struct {
	Success bool           `json:"success"`
	Data    []UserResponse `json:"data"`
	Count   int            `json:"count"`
}

// UserSuccessResponse representa la respuesta exitosa de un usuario individual
type UserSuccessResponse struct {
	Success bool         `json:"success"`
	Data    UserResponse `json:"data"`
}

// UserMessageResponse representa la respuesta de mensaje para usuarios
type UserMessageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// UserErrorResponse representa la respuesta de error para usuarios
type UserErrorResponse struct {
	Error string `json:"error"`
}

// UserCreatedResponse representa la respuesta al crear un usuario, incluyendo la contraseña generada
// ¡La contraseña solo se muestra una vez en la creación!
type UserCreatedResponse struct {
	Success  bool   `json:"success"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Message  string `json:"message"`
}
