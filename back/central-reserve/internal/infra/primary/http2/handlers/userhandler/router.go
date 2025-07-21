package userhandler

import (
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/jwt"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de usuarios
func RegisterRoutes(router *gin.RouterGroup, handler IUserHandler, jwtService *jwt.JWTService, logger log.ILogger) {
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
