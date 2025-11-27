package handlervotingoptions

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotingoptions"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IVotingOptionsHandler define la interfaz para handlers de opciones de votación
type IVotingOptionsHandler interface {
	CreateVotingOption(c *gin.Context)
	ListVotingOptions(c *gin.Context)
	GetVotingOptionByID(c *gin.Context)
	UpdateVotingOptionStatus(c *gin.Context)
	DeleteVotingOption(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// VotingOptionsHandler maneja las peticiones HTTP de opciones de votación
type VotingOptionsHandler struct {
	votingUseCase usecasevotingoptions.IVotingOptionsUseCase
	logger        log.ILogger
}

// NewVotingOptionsHandler crea una nueva instancia del handler de opciones de votación
func New(votingUseCase usecasevotingoptions.IVotingOptionsUseCase, logger log.ILogger) IVotingOptionsHandler {
	contextualLogger := logger.WithModule("voting-options-handler")
	return &VotingOptionsHandler{
		votingUseCase: votingUseCase,
		logger:        contextualLogger,
	}
}
