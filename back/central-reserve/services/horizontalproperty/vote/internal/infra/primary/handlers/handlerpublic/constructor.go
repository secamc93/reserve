package handlerpublic

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasepublic"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseshared"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IPublicHandler define la interfaz para handlers de votaciones públicas
type IPublicHandler interface {
	CreatePublicVote(c *gin.Context)
	GetPublicVotingContext(c *gin.Context)
	GetPublicPropertyUnits(c *gin.Context)
	GetPublicVotingInfo(c *gin.Context)
	GetPublicVotingStats(c *gin.Context)
	GetPublicVotes(c *gin.Context)
	GetPublicUnitsWithResidents(c *gin.Context)
	ValidateResidentForVoting(c *gin.Context)
	GeneratePublicVotingURL(c *gin.Context)
	PublicSSEVotingResults(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// PublicHandler maneja las peticiones HTTP de votaciones públicas
type PublicHandler struct {
	publicUseCase       usecasepublic.IPublicUseCase
	votingGroupsUseCase usecasevotinggroups.IVotingGroupUseCase
	votingsUseCase      usecasevotings.IVotingsUseCase
	votesUseCase        usecasevotes.IVotesUseCase
	resultsUseCase      usecaseresults.IResultsUseCase
	sharedUseCase       usecaseshared.ISharedUseCase
	votingCache         domain.VotingCacheService
	jwtSecret           string
	logger              log.ILogger
}

// NewPublicHandler crea una nueva instancia del handler de votaciones públicas
func New(
	publicUseCase usecasepublic.IPublicUseCase,
	votingGroupsUseCase usecasevotinggroups.IVotingGroupUseCase,
	votingsUseCase usecasevotings.IVotingsUseCase,
	votesUseCase usecasevotes.IVotesUseCase,
	resultsUseCase usecaseresults.IResultsUseCase,
	sharedUseCase usecaseshared.ISharedUseCase,
	votingCache domain.VotingCacheService,
	jwtSecret string,
	logger log.ILogger,
) IPublicHandler {
	contextualLogger := logger.WithModule("public-handler")
	return &PublicHandler{
		publicUseCase:       publicUseCase,
		votingGroupsUseCase: votingGroupsUseCase,
		votingsUseCase:      votingsUseCase,
		votesUseCase:        votesUseCase,
		resultsUseCase:      resultsUseCase,
		sharedUseCase:       sharedUseCase,
		votingCache:         votingCache,
		jwtSecret:           jwtSecret,
		logger:              contextualLogger,
	}
}
