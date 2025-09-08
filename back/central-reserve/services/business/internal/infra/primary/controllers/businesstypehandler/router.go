package businesstypehandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de BusinessType
func RegisterRoutes(router *gin.RouterGroup, handler IBusinessTypeHandler, jwtService ports.IJWTService, logger log.ILogger) {
	// Aplicar middleware de autenticación a todas las rutas
	router.Use(middleware.AuthMiddleware(jwtService, logger))

	// Rutas de BusinessType
	router.GET("/business-types", handler.GetBusinessTypesHandler)
	router.GET("/business-types/:id", handler.GetBusinessTypeByIDHandler)
	router.POST("/business-types", handler.CreateBusinessTypeHandler)
	router.PUT("/business-types/:id", handler.UpdateBusinessTypeHandler)
	router.DELETE("/business-types/:id", handler.DeleteBusinessTypeHandler)
}
