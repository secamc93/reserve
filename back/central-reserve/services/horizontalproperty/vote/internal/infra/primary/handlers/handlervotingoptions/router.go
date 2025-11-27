package handlervotingoptions

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterVotingOptionsRoutes registra las rutas propias del módulo handler-voting-options.
// Debe montarse sobre:
// /horizontal-properties/voting-groups/:group_id/votings/:voting_id/options
func (h *VotingOptionsHandler) Router(group *gin.RouterGroup) {
	group.POST("", middleware.JWT(), h.CreateVotingOption)
	group.GET("", middleware.JWT(), h.ListVotingOptions)
	group.GET("/:option_id", middleware.JWT(), h.GetVotingOptionByID)
	group.PATCH("/:option_id/status", middleware.JWT(), h.UpdateVotingOptionStatus)
	group.DELETE("/:option_id", middleware.JWT(), h.DeleteVotingOption)
}
