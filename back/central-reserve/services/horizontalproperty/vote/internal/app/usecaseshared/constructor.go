package usecaseshared

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// ISharedUseCase define la interfaz para casos de uso compartidos
type ISharedUseCase interface {
	GetResidentMainUnitID(ctx context.Context, residentID uint) (uint, error)
	CheckUnitAttendanceForVoting(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
	GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*domain.HorizontalPropertyDTO, error)
	ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error)
	GetUnitsWithResidents(ctx context.Context, hpID uint) ([]domain.UnitWithResidentDTO, error)
}

// SharedUseCase maneja la lógica de negocio compartida entre casos de uso
type SharedUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso compartido
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *SharedUseCase {
	return &SharedUseCase{
		logger: logger.WithModule("compartido"),
		repo:   repo,
		cache:  cache,
	}
}
