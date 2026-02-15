package usecasepublic

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IPublicUseCase define la interfaz para casos de uso de votaciones públicas
type IPublicUseCase interface {
	ValidateResidentForVoting(ctx context.Context, hpID, propertyUnitID uint, dni string) (*domain.ResidentBasicDTO, error)
	ListVotingsByGroupWithVoteStatus(ctx context.Context, groupID uint, propertyUnitID uint) ([]domain.VotingWithStatusDTO, error)
}

// PublicUseCase maneja la lógica de negocio de votaciones públicas
type PublicUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de votaciones públicas
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *PublicUseCase {
	return &PublicUseCase{
		logger: logger.WithModule("votaciones_publicas"),
		repo:   repo,
		cache:  cache,
	}
}
