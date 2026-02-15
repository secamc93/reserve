package domain

import "time"

// CreateGroupDTO - DTO para crear grupo de entrenamiento
type CreateGroupDTO struct {
	BusinessID        uint
	CoachID           uint
	Name              string
	Code              string
	Category          string
	Description       string
	MaxCapacity       int
	AgeMin            *int
	AgeMax            *int
	SkillLevelID      *uint
	RecurringSchedule string
	PhotoURL          string
}

// UpdateGroupDTO - DTO para actualizar grupo de entrenamiento
type UpdateGroupDTO struct {
	ID                uint
	BusinessID        uint
	CoachID           uint
	Name              string
	Code              string
	Category          string
	Description       string
	MaxCapacity       int
	AgeMin            *int
	AgeMax            *int
	SkillLevelID      *uint
	RecurringSchedule string
	PhotoURL          string
	IsActive          bool
}

// GroupFiltersDTO - Filtros para listar grupos
type GroupFiltersDTO struct {
	BusinessID   uint
	CoachID      *uint
	Category     string
	SkillLevelID *uint
	Name         string
	IsActive     *bool
	Page         int
	PageSize     int
}

// PaginatedGroupsDTO - Resultado paginado de grupos
type PaginatedGroupsDTO struct {
	Groups     []GroupListDTO
	Total      int64
	Page       int
	PageSize   int
	TotalPages int
}

// GroupListDTO - DTO para lista de grupos
type GroupListDTO struct {
	ID              uint
	Name            string
	Code            string
	Category        string
	CoachName       string
	MaxCapacity     int
	CurrentCapacity int
	SkillLevelName  string
	IsActive        bool
	CreatedAt       time.Time
}

// AddPlayerDTO - DTO para agregar jugador a grupo
type AddPlayerDTO struct {
	GroupID  uint
	PlayerID uint
	Notes    string
}

// GroupPlayerDTO - DTO para jugador en grupo
type GroupPlayerDTO struct {
	PlayerID       uint
	FirstName      string
	LastName       string
	EnrollmentDate time.Time
	IsActive       bool
}
