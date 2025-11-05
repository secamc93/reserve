package permissionhandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas para el handler de permisos
func (h *PermissionHandler) RegisterRoutes(router *gin.RouterGroup, handler IPermissionHandler, logger log.ILogger) {
	permissionsGroup := router.Group("/permissions")
	{
		permissionsGroup.GET("", middleware.JWT(), handler.GetPermissionsHandler)
		permissionsGroup.GET("/:id", middleware.JWT(), handler.GetPermissionByIDHandler)
		permissionsGroup.GET("/scope/:scope_id", middleware.JWT(), handler.GetPermissionsByScopeHandler)
		permissionsGroup.GET("/resource/:resource", middleware.JWT(), handler.GetPermissionsByResourceHandler)
		permissionsGroup.POST("", middleware.JWT(), handler.CreatePermissionHandler)
		permissionsGroup.PUT("/:id", middleware.JWT(), handler.UpdatePermissionHandler)
		permissionsGroup.DELETE("/:id", middleware.JWT(), handler.DeletePermissionHandler)
	}
}
