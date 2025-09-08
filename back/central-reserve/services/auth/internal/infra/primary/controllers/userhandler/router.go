package userhandler

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de usuarios
func RegisterRoutes(router *gin.RouterGroup, handler IUserHandler, jwtService domain.IJWTService, logger log.ILogger) {
	// Grupo de rutas para usuarios (protegidas con JWT)
	usersGroup := router.Group("/users")
	usersGroup.Use(middleware.AuthMiddleware(jwtService, logger))

	// Rutas CRUD
	usersGroup.GET("", handler.GetUsersHandler)
	usersGroup.GET("/:id", handler.GetUserByIDHandler)
	usersGroup.POST("", handler.CreateUserHandler)
	usersGroup.PUT("/:id", handler.UpdateUserHandler)
	usersGroup.DELETE("/:id", handler.DeleteUserHandler)
}
