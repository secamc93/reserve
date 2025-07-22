package authhandler

import (
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de autenticación
func RegisterRoutes(v1Group *gin.RouterGroup, handler IAuthHandler, jwtService *jwt.JWTService, logger log.ILogger) {
	// Crear el subgrupo /auth dentro de /api/v1
	authGroup := v1Group.Group("/auth")
	{
		// Rutas públicas (sin autenticación)
		authGroup.POST("/login", handler.LoginHandler)

		// Rutas protegidas que requieren autenticación
		protectedGroup := authGroup.Group("")
		protectedGroup.Use(middleware.AuthMiddleware(jwtService, logger))
		{
			protectedGroup.GET("/roles-permissions", handler.GetUserRolesPermissionsHandler)
			protectedGroup.POST("/change-password", handler.ChangePasswordHandler)
		}
	}
}
