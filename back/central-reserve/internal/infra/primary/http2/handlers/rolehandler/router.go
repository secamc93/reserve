package rolehandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de roles
func RegisterRoutes(router *gin.RouterGroup, handler IRoleHandler, jwtService ports.IJWTService, logger log.ILogger) {
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
