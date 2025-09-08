package authhandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(v1Group *gin.RouterGroup, handler IAuthHandler, jwtService domain.IJWTService, logger log.ILogger) {
	// Crear el subgrupo /auth dentro de /api/v1
	authGroup := v1Group.Group("/auth")
	{
		// Rutas públicas
		authGroup.POST("/login", handler.LoginHandler)

		// Rutas protegidas (requieren JWT)
		protected := authGroup.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtService, logger))
		{
			protected.GET("/verify", handler.VerifyHandler)
			protected.GET("/roles-permissions", handler.GetUserRolesPermissionsHandler)
			protected.POST("/change-password", handler.ChangePasswordHandler)
			// protected.POST("/generate-api-key", handler.GenerateAPIKeyHandler)
		}
	}
}
