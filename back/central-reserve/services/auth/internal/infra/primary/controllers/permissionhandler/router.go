package permissionhandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas para el handler de permisos
func RegisterRoutes(router *gin.RouterGroup, handler IPermissionHandler, jwtService domain.IJWTService, logger log.ILogger) {
	permissionsGroup := router.Group("/permissions")
	permissionsGroup.Use(middleware.AuthMiddleware(jwtService, logger))

	// Rutas para permisos
	permissionsGroup.GET("", handler.GetPermissionsHandler)
	permissionsGroup.GET("/:id", handler.GetPermissionByIDHandler)
	permissionsGroup.GET("/scope/:scope_id", handler.GetPermissionsByScopeHandler)
	permissionsGroup.GET("/resource/:resource", handler.GetPermissionsByResourceHandler)
	permissionsGroup.POST("", handler.CreatePermissionHandler)
	permissionsGroup.PUT("/:id", handler.UpdatePermissionHandler)
	permissionsGroup.DELETE("/:id", handler.DeletePermissionHandler)
}
