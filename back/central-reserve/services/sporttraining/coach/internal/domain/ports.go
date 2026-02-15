package domain

import "context"

// CoachRepository - Puerto para repositorio de entrenadores
type CoachRepository interface {
	Create(ctx context.Context, coach *Coach) (*Coach, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*Coach, error)
	Update(ctx context.Context, coach *Coach) (*Coach, error)
	List(ctx context.Context, filters CoachFiltersDTO) (*PaginatedCoachesDTO, error)
	AssignSpecialty(ctx context.Context, dto AssignSpecialtyDTO) error
	GetSpecialties(ctx context.Context, coachID uint, businessID uint) ([]SpecialtyAssignment, error)
}

// CoachUseCase - Puerto para casos de uso de entrenadores
type CoachUseCase interface {
	CreateCoach(ctx context.Context, dto CreateCoachDTO) (*Coach, error)
	GetCoachByID(ctx context.Context, id uint, businessID uint) (*Coach, error)
	UpdateCoach(ctx context.Context, dto UpdateCoachDTO) (*Coach, error)
	ListCoaches(ctx context.Context, filters CoachFiltersDTO) (*PaginatedCoachesDTO, error)
	AssignSpecialty(ctx context.Context, dto AssignSpecialtyDTO) error
}
