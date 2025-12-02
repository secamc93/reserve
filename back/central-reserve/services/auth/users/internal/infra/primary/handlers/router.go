package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de usuarios
func (h *handlers) RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger) {
	usersGroup := router.Group("/users")

	{
		usersGroup.GET("", middleware.JWT(), handler.GetUsersHandler)
		usersGroup.GET("/:id", middleware.JWT(), handler.GetUserByIDHandler)
		usersGroup.POST("", middleware.JWT(), handler.Createhandlers)
		usersGroup.PUT("/:id", middleware.JWT(), handler.Updatehandlers)
		usersGroup.DELETE("/:id", middleware.JWT(), handler.Deletehandlers)
		usersGroup.POST("/:id/assign-role", middleware.JWT(), handler.AssignRoleToUserBusinessHandler)
	}
}
