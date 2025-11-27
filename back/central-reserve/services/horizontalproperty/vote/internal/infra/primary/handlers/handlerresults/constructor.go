package handlerresults

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IResultsHandler define la interfaz para handlers de resultados
type IResultsHandler interface {
	GetVotingDetailsAdmin(c *gin.Context)
	GetUnvotedUnitsByVoting(c *gin.Context)
	SSEVotingResults(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// ResultsHandler maneja las peticiones HTTP de resultados
type ResultsHandler struct {
	resultsUseCase usecaseresults.IResultsUseCase
	votingsUseCase usecasevotings.IVotingsUseCase
	votesUseCase   usecasevotes.IVotesUseCase
	votingCache    domain.VotingCacheService
	logger         log.ILogger
}

// NewResultsHandler crea una nueva instancia del handler de resultados
func New(
	resultsUseCase usecaseresults.IResultsUseCase,
	votingsUseCase usecasevotings.IVotingsUseCase,
	votesUseCase usecasevotes.IVotesUseCase,
	votingCache domain.VotingCacheService,
	logger log.ILogger,
) IResultsHandler {
	contextualLogger := logger.WithModule("results-handler")
	return &ResultsHandler{
		resultsUseCase: resultsUseCase,
		votingsUseCase: votingsUseCase,
		votesUseCase:   votesUseCase,
		votingCache:    votingCache,
		logger:         contextualLogger,
	}
}
