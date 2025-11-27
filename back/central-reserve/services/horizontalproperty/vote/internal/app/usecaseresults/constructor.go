package usecaseresults

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

// IResultsUseCase define la interfaz para casos de uso de resultados
type IResultsUseCase interface {
	GetVotingResults(ctx context.Context, votingID uint) ([]domain.VotingResultDTO, error)
	GetVotingDetailsByUnit(ctx context.Context, votingID, hpID uint) ([]domain.VotingDetailByUnitDTO, error)
	GetUnvotedUnitsByVoting(ctx context.Context, votingID uint, unitNumberFilter string) ([]domain.UnvotedUnitDTO, error)
}

// ResultsUseCase maneja la lógica de negocio de resultados de votaciones
type ResultsUseCase struct {
	repo   domain.VotingRepository
	cache  domain.VotingCacheService
	logger log.ILogger
}

// New crea una nueva instancia del caso de uso de resultados
func New(repo domain.VotingRepository, cache domain.VotingCacheService, logger log.ILogger) *ResultsUseCase {
	return &ResultsUseCase{
		logger: logger.WithModule("resultados_de_votaciones"),
		repo:   repo,
		cache:  cache,
	}
}
