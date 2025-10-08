package usecasevote

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type votingUseCase struct {
	repo   domain.VotingRepository
	logger log.ILogger
}

func NewVotingUseCase(repo domain.VotingRepository, logger log.ILogger) domain.VotingUseCase {
	return &votingUseCase{repo: repo, logger: logger}
}
