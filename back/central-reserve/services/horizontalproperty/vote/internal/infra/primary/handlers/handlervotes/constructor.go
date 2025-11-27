package handlervotes

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IVotesHandler define la interfaz para handlers de votos
type IVotesHandler interface {
	CreateVote(c *gin.Context)
	ListVotes(c *gin.Context)
	DeleteVoteAdmin(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// VotesHandler maneja las peticiones HTTP de votos
type VotesHandler struct {
	votingUseCase usecasevotes.IVotesUseCase
	logger        log.ILogger
}

// NewVotesHandler crea una nueva instancia del handler de votos
func New(votingUseCase usecasevotes.IVotesUseCase, logger log.ILogger) IVotesHandler {
	contextualLogger := logger.WithModule("votes-handler")
	return &VotesHandler{
		votingUseCase: votingUseCase,
		logger:        contextualLogger,
	}
}
