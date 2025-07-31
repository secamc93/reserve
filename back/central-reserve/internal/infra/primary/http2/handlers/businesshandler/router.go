package businesshandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de Business
func RegisterRoutes(router *gin.RouterGroup, handler IBusinessHandler, jwtService ports.IJWTService, logger log.ILogger) {
	// Aplicar middleware de autenticación a todas las rutas
	router.Use(middleware.AuthMiddleware(jwtService, logger))

	// Rutas de Business
	router.GET("/businesses", handler.GetBusinessesHandler)
	router.GET("/businesses/:id", handler.GetBusinessByIDHandler)
	router.POST("/businesses", handler.CreateBusinessHandler)
	router.PUT("/businesses/:id", handler.UpdateBusinessHandler)
	router.DELETE("/businesses/:id", handler.DeleteBusinessHandler)
}
