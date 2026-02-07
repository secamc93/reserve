package domain

import "context"

// GuardianRepository - Puerto para repositorio de tutores
type GuardianRepository interface {
	Create(ctx context.Context, guardian *Guardian) (*Guardian, error)
	GetByID(ctx context.Context, id uint, businessID uint) (*Guardian, error)
	Update(ctx context.Context, guardian *Guardian) (*Guardian, error)
	List(ctx context.Context, filters GuardianFiltersDTO) (*PaginatedGuardiansDTO, error)
	AssignToPlayer(ctx context.Context, assignment *PlayerGuardianAssignment) error
	GetPlayerGuardians(ctx context.Context, playerID uint, businessID uint) ([]PlayerGuardianDTO, error)
}

// GuardianUseCase - Puerto para casos de uso de tutores
type GuardianUseCase interface {
	CreateGuardian(ctx context.Context, dto CreateGuardianDTO) (*Guardian, error)
	GetGuardianByID(ctx context.Context, id uint, businessID uint) (*Guardian, error)
	UpdateGuardian(ctx context.Context, dto UpdateGuardianDTO) (*Guardian, error)
	ListGuardians(ctx context.Context, filters GuardianFiltersDTO) (*PaginatedGuardiansDTO, error)
	AssignGuardianToPlayer(ctx context.Context, dto AssignGuardianDTO) error
	GetPlayerGuardians(ctx context.Context, playerID uint, businessID uint) ([]PlayerGuardianDTO, error)
}
