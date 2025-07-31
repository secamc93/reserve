package tablehandler

import (
	"central_reserve/internal/domain/ports"
	"central_reserve/internal/infra/primary/http2/middleware"
	"central_reserve/internal/pkg/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de mesas
func RegisterRoutes(v1Group *gin.RouterGroup, handler ITableHandler, jwtService ports.IJWTService, logger log.ILogger) {
	// Crear el subgrupo /tables dentro de /api/v1
	tables := v1Group.Group("/tables")
	// Aplicar middleware de autenticación a todas las rutas de mesas
	tables.Use(middleware.AuthMiddleware(jwtService, logger))
	{
		tables.GET("", handler.GetTablesHandler)
		tables.GET("/:id", handler.GetTableByIDHandler)
		tables.POST("", handler.CreateTableHandler)
		tables.PUT("/:id", handler.UpdateTableHandler)
		tables.DELETE("/:id", handler.DeleteTableHandler)
	}
}
