package usecasevotes

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IVotesUseCase define la interfaz para casos de uso de votos
type IVotesUseCase interface {
	CreateVote(ctx context.Context, dto domain.CreateVoteDTO) (*domain.VoteDTO, error)
	CreateBulkVotes(ctx context.Context, dto domain.CreateBulkVotesDTO) (*domain.BulkVoteResultDTO, error)
	GetVoteByID(ctx context.Context, voteID uint) (*domain.VoteDTO, error)
	DeleteVote(ctx context.Context, voteID uint) error
	ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.VoteDTO, error)
	HasUnitVoted(ctx context.Context, votingID, propertyUnitID uint) (bool, error)
	GetUnitVote(ctx context.Context, votingID, propertyUnitID uint) (*domain.VoteDTO, error)
	MarkUnitAttendance(ctx context.Context, votingID, propertyUnitID uint, markAttendance bool) error
	ResetVoting(ctx context.Context, votingID uint) (*domain.ResetVotingResultDTO, error)
	GetPreviousVotingVotedUnits(ctx context.Context, votingID uint, groupID uint) (*domain.PreviousVotingVotedUnitsDTO, error)
}

// VotesUseCase maneja la lógica de negocio de votos
type VotesUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de votos
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *VotesUseCase {
	return &VotesUseCase{
		logger: logger.WithModule("votos"),
		repo:   repo,
		cache:  cache,
	}
}
