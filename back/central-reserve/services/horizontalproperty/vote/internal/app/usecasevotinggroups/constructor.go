package usecasevotinggroups

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IVotingGroupUseCase define la interfaz para casos de uso de grupos de votación
type IVotingGroupUseCase interface {
	CreateVotingGroup(ctx context.Context, dto domain.CreateVotingGroupDTO) (*domain.VotingGroupDTO, error)
	GetVotingGroupByID(ctx context.Context, id uint) (*domain.VotingGroupDTO, error)
	ListVotingGroupsByBusiness(ctx context.Context, businessID uint) ([]domain.VotingGroupDTO, error)
	UpdateVotingGroup(ctx context.Context, id uint, dto domain.CreateVotingGroupDTO) (*domain.VotingGroupDTO, error)
	DeactivateVotingGroup(ctx context.Context, id uint) error
	DeleteVotingGroup(ctx context.Context, id uint) error
}

// VotingGroupUseCase maneja la lógica de negocio de grupos de votación
type VotingGroupUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de grupos de votación
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *VotingGroupUseCase {
	return &VotingGroupUseCase{
		logger: logger.WithModule("grupos_de_votaciones"),
		repo:   repo,
		cache:  cache,
	}
}
