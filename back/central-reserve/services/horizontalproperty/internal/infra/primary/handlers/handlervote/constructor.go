package handlervote

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

type VotingHandler struct {
	votingUseCase             domain.VotingUseCase
	votingRepository          domain.VotingRepository
	propertyUnitUseCase       domain.PropertyUnitUseCase
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase
	votingCache               domain.VotingCacheService
	jwtSecret                 string
	logger                    log.ILogger
}

func NewVotingHandler(
	votingUseCase domain.VotingUseCase,
	votingRepository domain.VotingRepository,
	propertyUnitUseCase domain.PropertyUnitUseCase,
	horizontalPropertyUseCase domain.HorizontalPropertyUseCase,
	votingCache domain.VotingCacheService,
	jwtSecret string,
	logger log.ILogger,
) *VotingHandler {
	// El logger ya viene con service="horizontalproperty" desde el bundle
	// Solo agregamos el módulo específico
	contextualLogger := logger.WithModule("votaciones")

	return &VotingHandler{
		votingUseCase:             votingUseCase,
		votingRepository:          votingRepository,
		propertyUnitUseCase:       propertyUnitUseCase,
		horizontalPropertyUseCase: horizontalPropertyUseCase,
		votingCache:               votingCache,
		jwtSecret:                 jwtSecret,
		logger:                    contextualLogger,
	}
}
