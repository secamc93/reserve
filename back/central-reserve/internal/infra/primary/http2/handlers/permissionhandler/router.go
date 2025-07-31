package permissionhandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas para el handler de permisos
func RegisterRoutes(router *gin.RouterGroup, handler IPermissionHandler, jwtService ports.IJWTService, logger log.ILogger) {
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
