package response

import "time"

// TableResponse representa una mesa en la respuesta API
type TableResponse struct {
	ID         uint      `json:"id"`
	BusinessID uint      `json:"business_id"`
	Number     int       `json:"number"`
	Capacity   int       `json:"capacity"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// GetTablesResponse representa la respuesta para obtener múltiples mesas
type GetTablesResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    []TableResponse `json:"data"`
}

// GetTableResponse representa la respuesta para obtener una mesa
type GetTableResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    TableResponse `json:"data"`
}

// CreateTableResponse representa la respuesta para crear una mesa
type CreateTableResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    TableResponse `json:"data"`
}

// UpdateTableResponse representa la respuesta para actualizar una mesa
type UpdateTableResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    TableResponse `json:"data"`
}

// DeleteTableResponse representa la respuesta para eliminar una mesa
type DeleteTableResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// ErrorResponse representa una respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Message string `json:"message"`
}
