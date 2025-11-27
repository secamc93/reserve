package handlervotinggroups

import (
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// IVotingGroupsHandler define la interfaz para handlers de grupos de votación
type IVotingGroupsHandler interface {
	CreateVotingGroup(c *gin.Context)
	ListVotingGroups(c *gin.Context)
	UpdateVotingGroup(c *gin.Context)
	DeleteVotingGroup(c *gin.Context)
	DeactivateVotingGroup(c *gin.Context)
	Router(group *gin.RouterGroup)
}

// VotingGroupsHandler maneja las peticiones HTTP de grupos de votación
type VotingGroupsHandler struct {
	votingUseCase usecasevotinggroups.IVotingGroupUseCase
	logger        log.ILogger
}

// New crea una nueva instancia del handler de grupos de votación
func New(votingUseCase usecasevotinggroups.IVotingGroupUseCase, logger log.ILogger) IVotingGroupsHandler {
	return &VotingGroupsHandler{
		votingUseCase: votingUseCase,
		logger:        logger.WithModule("voting-groups-handler"),
	}
}
