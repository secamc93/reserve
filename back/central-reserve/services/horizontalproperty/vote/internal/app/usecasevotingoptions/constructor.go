package usecasevotingoptions

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IVotingOptionsUseCase define la interfaz para casos de uso de opciones de votación
type IVotingOptionsUseCase interface {
	CreateVotingOption(ctx context.Context, dto domain.CreateVotingOptionDTO) (*domain.VotingOptionDTO, error)
	ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]domain.VotingOptionDTO, error)
	GetVotingOptionByID(ctx context.Context, id uint) (*domain.VotingOptionDTO, error)
	UpdateVotingOptionStatus(ctx context.Context, id uint, isActive bool) (*domain.VotingOptionDTO, error)
	DeleteVotingOption(ctx context.Context, id uint) error
}

// VotingOptionsUseCase maneja la lógica de negocio de opciones de votación
type VotingOptionsUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de opciones de votación
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *VotingOptionsUseCase {
	return &VotingOptionsUseCase{
		logger: logger.WithModule("opciones_de_votaciones"),
		repo:   repo,
		cache:  cache,
	}
}
