package handlervotes

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterVotesRoutes registra las rutas propias del módulo handler-votes.
// Debe montarse sobre:
// /horizontal-properties/voting-groups/:group_id/votings/:voting_id/votes
func (h *VotesHandler) Router(group *gin.RouterGroup) {
	group.POST("", middleware.JWT(), h.CreateVote)
	group.POST("/bulk", middleware.JWT(), h.CreateBulkVotes)
	group.GET("", middleware.JWT(), h.ListVotes)
	group.GET("/previous-voted-units", middleware.JWT(), h.GetPreviousVotingVotedUnits)
	group.DELETE("/reset", middleware.JWT(), h.ResetVoting)
	group.DELETE("/:vote_id", middleware.JWT(), h.DeleteVoteAdmin)
}
