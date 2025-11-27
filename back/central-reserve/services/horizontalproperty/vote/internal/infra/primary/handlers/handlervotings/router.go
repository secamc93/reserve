package handlervotings

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// Route registra las rutas propias del módulo handler-votings.
func (h *VotingsHandler) Router(group *gin.RouterGroup) {

	group.POST("", middleware.JWT(), h.CreateVoting)
	group.GET("", middleware.JWT(), h.ListVotings)
	group.PUT("/:voting_id", middleware.JWT(), h.UpdateVoting)
	group.DELETE("/:voting_id", middleware.JWT(), h.DeleteVoting)

	group.PATCH("/:voting_id/activate", middleware.JWT(), h.ActivateVoting)
	group.PATCH("/:voting_id/deactivate", middleware.JWT(), h.DeactivateVotingHandler)
}
