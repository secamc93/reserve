package userhandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de usuarios
func (h *UserHandler) RegisterRoutes(router *gin.RouterGroup, handler IUserHandler, logger log.ILogger) {
	usersGroup := router.Group("/users")

	{
		usersGroup.GET("", middleware.JWT(), handler.GetUsersHandler)
		usersGroup.GET("/:id", middleware.JWT(), handler.GetUserByIDHandler)
		usersGroup.POST("", middleware.JWT(), handler.CreateUserHandler)
		usersGroup.PUT("/:id", middleware.JWT(), handler.UpdateUserHandler)
		usersGroup.DELETE("/:id", middleware.JWT(), handler.DeleteUserHandler)
		usersGroup.POST("/:id/assign-role", middleware.JWT(), handler.AssignRoleToUserBusinessHandler)
	}
}
