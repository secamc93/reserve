package handlerresults

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// Router registra las rutas del módulo handler-results sobre el grupo recibido.
func (h *ResultsHandler) Router(group *gin.RouterGroup) {
	group.GET("/:voting_id/stream", middleware.JWT(), h.SSEVotingResults)
	group.GET("/:voting_id/voting-details", middleware.JWT(), h.GetVotingDetailsAdmin)
	group.GET("/:voting_id/unvoted-units", middleware.JWT(), h.GetUnvotedUnitsByVoting)
}
