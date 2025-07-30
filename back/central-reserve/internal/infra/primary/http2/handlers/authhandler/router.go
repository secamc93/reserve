package authhandler

import (
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IAuthHandler, jwtService *jwt.JWTService, logger log.ILogger) {
	// Crear el subgrupo /auth dentro de /api/v1
	authGroup := v1Group.Group("/auth")
	{
		// Rutas públicas
		authGroup.POST("/login", handler.LoginHandler)

		// Rutas protegidas (requieren JWT)
		protected := authGroup.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtService, logger))
		{
			protected.GET("/roles-permissions", handler.GetUserRolesPermissionsHandler)
			protected.POST("/change-password", handler.ChangePasswordHandler)
			protected.POST("/generate-api-key", handler.GenerateAPIKeyHandler)
		}
	}
}
