package handlervotings

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IVotingsHandler define la interfaz para handlers de votaciones
type IVotingsHandler interface {
	CreateVoting(c *gin.Context)
	ListVotings(c *gin.Context)
	UpdateVoting(c *gin.Context)
	DeleteVoting(c *gin.Context)
	ActivateVoting(c *gin.Context)
	DeactivateVoting(c *gin.Context)
	DeactivateVotingHandler(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// VotingsHandler maneja las peticiones HTTP de votaciones
type VotingsHandler struct {
	votingUseCase usecasevotings.IVotingsUseCase
	logger        log.ILogger
}

// NewVotingsHandler crea una nueva instancia del handler de votaciones
func New(votingUseCase usecasevotings.IVotingsUseCase, logger log.ILogger) IVotingsHandler {
	contextualLogger := logger.WithModule("votings-handler")
	return &VotingsHandler{
		votingUseCase: votingUseCase,
		logger:        contextualLogger,
	}
}
