package handlerattendance

// Tipos locales solo para documentación Swagger (evitan referencias cruzadas de paquete).

// ErrorResponse - Respuesta de error genérica
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

// AttendanceListResponseDoc - Estructura de lista (mirror para doc)
type AttendanceListResponseDoc struct {
	ID              uint   `json:"id"`
	VotingGroupID   uint   `json:"voting_group_id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	IsActive        bool   `json:"is_active"`
	CreatedByUserID *uint  `json:"created_by_user_id,omitempty"`
	Notes           string `json:"notes"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"updated_at"`
}

// AttendanceListSuccess - Envoltorio de éxito con una lista de asistencia
type AttendanceListSuccess struct {
	Success bool                      `json:"success"`
	Message string                    `json:"message"`
	Data    AttendanceListResponseDoc `json:"data"`
}
