package response

import "time"

// ClientData - Datos del cliente para respuestas HTTP
type ClientData struct {
	ID         uint       `json:"id"`
	BusinessID uint       `json:"business_id"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Phone      string     `json:"phone"`
	Dni        *string    `json:"dni,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// ClientResponse - Respuesta de cliente único
type ClientResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Data    ClientData `json:"data"`
}

// ClientsResponse - Respuesta de lista de clientes
type ClientsResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    []ClientData `json:"data"`
}

// MessageResponse - Respuesta genérica con mensaje
type MessageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    string `json:"data,omitempty"`
}
