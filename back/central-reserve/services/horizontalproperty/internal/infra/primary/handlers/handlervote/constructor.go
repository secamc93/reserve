package handlervote

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type VotingHandler struct {
	votingUseCase             domain.VotingUseCase
	propertyUnitUseCase       domain.PropertyUnitUseCase
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase
	votingCache               domain.VotingCacheService
	jwtSecret                 string
	logger                    log.ILogger
}

func NewVotingHandler(
	votingUseCase domain.VotingUseCase,
	propertyUnitUseCase domain.PropertyUnitUseCase,
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase,
	votingCache domain.VotingCacheService,
	jwtSecret string,
	logger log.ILogger,
) *VotingHandler {
	return &VotingHandler{
		votingUseCase:             votingUseCase,
		propertyUnitUseCase:       propertyUnitUseCase,
		horizontalPropertyUseCase: horizontalPropertyUseCase,
		votingCache:               votingCache,
		jwtSecret:                 jwtSecret,
		logger:                    logger,
	}
}
