package response

import "time"

// ErrorResponse - Respuesta de error
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SuccessResponse - Respuesta genérica de éxito
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GroupResponse - Respuesta de grupo de entrenamiento
type GroupResponse struct {
	Success bool      `json:"success"`
	Data    GroupData `json:"data"`
}

// GroupData - Datos completos del grupo de entrenamiento
type GroupData struct {
	ID                uint      `json:"id"`
	BusinessID        uint      `json:"business_id"`
	CoachID           uint      `json:"coach_id"`
	CoachName         string    `json:"coach_name"`
	Name              string    `json:"name"`
	Code              string    `json:"code"`
	Category          string    `json:"category"`
	Description       string    `json:"description"`
	MaxCapacity       int       `json:"max_capacity"`
	CurrentCapacity   int       `json:"current_capacity"`
	AgeMin            *int      `json:"age_min"`
	AgeMax            *int      `json:"age_max"`
	SkillLevelID      *uint     `json:"skill_level_id"`
	SkillLevelName    string    `json:"skill_level_name,omitempty"`
	RecurringSchedule string    `json:"recurring_schedule"`
	PhotoURL          string    `json:"photo_url"`
	IsActive          bool      `json:"is_active"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// GroupListData - Datos de grupo para lista
type GroupListData struct {
	ID              uint      `json:"id"`
	Name            string    `json:"name"`
	Code            string    `json:"code"`
	Category        string    `json:"category"`
	CoachName       string    `json:"coach_name"`
	MaxCapacity     int       `json:"max_capacity"`
	CurrentCapacity int       `json:"current_capacity"`
	SkillLevelName  string    `json:"skill_level_name"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
}

// PaginatedGroupsResponse - Respuesta paginada de grupos
type PaginatedGroupsResponse struct {
	Success    bool            `json:"success"`
	Data       []GroupListData `json:"data"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

// GroupPlayerData - Datos de jugador en grupo
type GroupPlayerData struct {
	PlayerID       uint      `json:"player_id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	EnrollmentDate time.Time `json:"enrollment_date"`
	IsActive       bool      `json:"is_active"`
}

// GroupPlayersResponse - Respuesta de jugadores de un grupo
type GroupPlayersResponse struct {
	Success bool              `json:"success"`
	Data    []GroupPlayerData `json:"data"`
}
