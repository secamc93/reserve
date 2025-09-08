package rolehandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de roles
func RegisterRoutes(router *gin.RouterGroup, handler IRoleHandler, jwtService domain.IJWTService, logger log.ILogger) {
	// Grupo de rutas para roles (protegidas con JWT)
	rolesGroup := router.Group("/roles")
	rolesGroup.Use(middleware.AuthMiddleware(jwtService, logger))

	// Rutas de consulta
	rolesGroup.GET("", handler.GetRolesHandler)
	rolesGroup.GET("/:id", handler.GetRoleByIDHandler)
	rolesGroup.GET("/scope/:scope_id", handler.GetRolesByScopeHandler)
	rolesGroup.GET("/level/:level", handler.GetRolesByLevelHandler)
	rolesGroup.GET("/system", handler.GetSystemRolesHandler)
}
