package handlervote

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type VotingHandler struct {
	votingUseCase domain.VotingUseCase
	logger        log.ILogger
}

func NewVotingHandler(votingUseCase domain.VotingUseCase, logger log.ILogger) *VotingHandler {
	return &VotingHandler{
		votingUseCase: votingUseCase,
		logger:        logger,
	}
}
