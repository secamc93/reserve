package rolehandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de roles
func (h *RoleHandler) RegisterRoutes(router *gin.RouterGroup, handler IRoleHandler, logger log.ILogger) {
	rolesGroup := router.Group("/roles")
	{
		rolesGroup.GET("", middleware.JWT(), handler.GetRolesHandler)
		rolesGroup.POST("", middleware.JWT(), handler.CreateRole)
		rolesGroup.GET("/:id", middleware.JWT(), handler.GetRoleByIDHandler)
		rolesGroup.PUT("/:id", middleware.JWT(), handler.UpdateRole)
		rolesGroup.GET("/scope/:scope_id", middleware.JWT(), handler.GetRolesByScopeHandler)
		rolesGroup.GET("/level/:level", middleware.JWT(), handler.GetRolesByLevelHandler)
		rolesGroup.GET("/system", middleware.JWT(), handler.GetSystemRolesHandler)

		// Rutas para gestionar permisos de roles
		rolesGroup.POST("/:id/permissions", middleware.JWT(), handler.AssignPermissionsToRole)
		rolesGroup.GET("/:id/permissions", middleware.JWT(), handler.GetRolePermissions)
		rolesGroup.DELETE("/:id/permissions/:permission_id", middleware.JWT(), handler.RemovePermissionFromRole)
	}
}
