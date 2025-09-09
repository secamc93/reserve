package authhandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *AuthHandler) RegisterRoutes(v1Group *gin.RouterGroup, handler IAuthHandler, logger log.ILogger) {
	authGroup := v1Group.Group("/auth")
	{
		authGroup.POST("/login", handler.LoginHandler)
		authGroup.GET("/verify", middleware.JWT(), handler.VerifyHandler)
		authGroup.GET("/roles-permissions", middleware.JWT(), handler.GetUserRolesPermissionsHandler)
		authGroup.POST("/change-password", middleware.JWT(), handler.ChangePasswordHandler)

	}
}
