package request

// CreateGroupRequest - Request para crear grupo de entrenamiento
type CreateGroupRequest struct {
	CoachID           uint   `json:"coach_id" binding:"required"`
	Name              string `json:"name" binding:"required"`
	Code              string `json:"code"`
	Category          string `json:"category"`
	Description       string `json:"description"`
	MaxCapacity       int    `json:"max_capacity" binding:"required"`
	AgeMin            *int   `json:"age_min"`
	AgeMax            *int   `json:"age_max"`
	SkillLevelID      *uint  `json:"skill_level_id"`
	RecurringSchedule string `json:"recurring_schedule"`
	PhotoURL          string `json:"photo_url"`
}

// UpdateGroupRequest - Request para actualizar grupo de entrenamiento
type UpdateGroupRequest struct {
	CoachID           uint   `json:"coach_id" binding:"required"`
	Name              string `json:"name" binding:"required"`
	Code              string `json:"code"`
	Category          string `json:"category"`
	Description       string `json:"description"`
	MaxCapacity       int    `json:"max_capacity" binding:"required"`
	AgeMin            *int   `json:"age_min"`
	AgeMax            *int   `json:"age_max"`
	SkillLevelID      *uint  `json:"skill_level_id"`
	RecurringSchedule string `json:"recurring_schedule"`
	PhotoURL          string `json:"photo_url"`
	IsActive          *bool  `json:"is_active"`
}

// AddPlayerRequest - Request para agregar jugador a grupo
type AddPlayerRequest struct {
	PlayerID uint   `json:"player_id" binding:"required"`
	Notes    string `json:"notes"`
}
