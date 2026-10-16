package handlercredentials

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// Router registra /horizontal-properties/voting-groups/:group_id/credentials sobre el grupo
// recibido (ya protegido por JWT y el ScopeGuard de :group_id).
func (h *CredentialsHandler) Router(group *gin.RouterGroup) {
	group.POST("/:group_id/credentials/generate", middleware.JWT(), h.GenerateCredentials)
	group.GET("/:group_id/credentials", middleware.JWT(), h.ListCredentials)
}
