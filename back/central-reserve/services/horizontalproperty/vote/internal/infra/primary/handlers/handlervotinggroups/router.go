package handlervotinggroups

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// Router registra las rutas del módulo handler-voting-groups sobre el grupo recibido.
func (h *VotingGroupsHandler) Router(group *gin.RouterGroup) {
	group.POST("", middleware.JWT(), h.CreateVotingGroup)
	group.GET("", middleware.JWT(), h.ListVotingGroups)
	group.PUT("/:group_id", middleware.JWT(), h.UpdateVotingGroup)
	group.DELETE("/:group_id", middleware.JWT(), h.DeleteVotingGroup)
}
