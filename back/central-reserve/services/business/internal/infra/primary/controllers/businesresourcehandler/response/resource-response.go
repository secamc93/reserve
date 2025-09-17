package response

import "time"

// ResourceResponse representa la respuesta de un recurso
type ResourceResponse struct {
	ID          uint      `json:"id" example:"1"`
	Name        string    `json:"name" example:"Reservas"`
	Code        string    `json:"code" example:"reservations"`
	Description string    `json:"description" example:"Gestión de reservas del negocio"`
	IsActive    bool      `json:"is_active" example:"true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
