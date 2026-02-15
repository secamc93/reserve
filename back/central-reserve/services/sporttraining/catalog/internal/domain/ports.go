package domain

import "context"

// CatalogRepository - Puerto para repositorio de catálogos
type CatalogRepository interface {
	GetSkillLevels(ctx context.Context) ([]PlayerSkillLevel, error)
	GetCoachSpecialties(ctx context.Context) ([]CoachSpecialty, error)
	GetSessionTypes(ctx context.Context) ([]TrainingSessionType, error)
	GetBookingStatuses(ctx context.Context) ([]BookingStatus, error)
	GetAttendanceStatuses(ctx context.Context) ([]AttendanceStatus, error)
}

// CatalogUseCase - Puerto para casos de uso de catálogos
type CatalogUseCase interface {
	GetSkillLevels(ctx context.Context) ([]PlayerSkillLevel, error)
	GetCoachSpecialties(ctx context.Context) ([]CoachSpecialty, error)
	GetSessionTypes(ctx context.Context) ([]TrainingSessionType, error)
	GetBookingStatuses(ctx context.Context) ([]BookingStatus, error)
	GetAttendanceStatuses(ctx context.Context) ([]AttendanceStatus, error)
}
