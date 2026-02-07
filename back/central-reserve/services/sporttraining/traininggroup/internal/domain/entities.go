package domain

import "time"

// TrainingGroup - Entidad de grupo de entrenamiento
type TrainingGroup struct {
	ID                uint
	BusinessID        uint
	CoachID           uint
	Name              string
	Code              string
	Category          string
	Description       string
	MaxCapacity       int
	CurrentCapacity   int
	AgeMin            *int
	AgeMax            *int
	SkillLevelID      *uint
	RecurringSchedule string
	PhotoURL          string
	IsActive          bool
	CreatedAt         time.Time
	UpdatedAt         time.Time

	// Relaciones
	Coach      *CoachRef
	SkillLevel *SkillLevelRef
	Players    []GroupPlayerInfo
}

// CoachRef - Referencia de entrenador
type CoachRef struct {
	ID        uint
	FirstName string
	LastName  string
}

// SkillLevelRef - Referencia de nivel de habilidad
type SkillLevelRef struct {
	ID    uint
	Name  string
	Code  string
	Level int
	Color string
}

// GroupPlayerInfo - Información de jugador en grupo
type GroupPlayerInfo struct {
	PlayerID       uint
	FirstName      string
	LastName       string
	EnrollmentDate time.Time
	IsActive       bool
}
