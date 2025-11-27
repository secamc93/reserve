package app

import (
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"
)

type votingUseCase struct {
	repo         domain.VotingRepository
	residentRepo domain.ResidentRepository
	logger       log.ILogger
}

func New(repo domain.VotingRepository, residentRepo domain.ResidentRepository, logger log.ILogger) domain.VotingUseCase {
	contextualLogger := logger.WithModule("votaciones")
	return &votingUseCase{
		repo:         repo,
		residentRepo: residentRepo,
		logger:       contextualLogger,
	}
}
