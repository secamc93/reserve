package usecasevotings

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IVotingsUseCase define la interfaz para casos de uso de votaciones
type IVotingsUseCase interface {
	CreateVoting(ctx context.Context, dto domain.CreateVotingDTO) (*domain.VotingDTO, error)
	GetVotingByID(ctx context.Context, hpID, groupID, votingID uint) (*domain.VotingDTO, error)
	ListVotingsByGroup(ctx context.Context, groupID uint) ([]domain.VotingDTO, error)
	UpdateVoting(ctx context.Context, id uint, dto domain.CreateVotingDTO) (*domain.VotingDTO, error)
	ActivateVoting(ctx context.Context, id uint) error
	DeactivateVoting(ctx context.Context, id uint) error
	DeleteVoting(ctx context.Context, id uint) error
	ListVotingsByGroupForDeletion(ctx context.Context, groupID uint) ([]domain.VotingDTO, error)
}

// VotingsUseCase maneja la lógica de negocio de votaciones
type VotingsUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de votaciones
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *VotingsUseCase {
	return &VotingsUseCase{
		logger: logger.WithModule("votaciones"),
		repo:   repo,
		cache:  cache,
	}
}
