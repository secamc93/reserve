package tablehandler

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de mesas
func RegisterRoutes(v1Group *gin.RouterGroup, handler ITableHandler, logger log.ILogger) {
	tables := v1Group.Group("/tables")

	{
		tables.GET("", middleware.JWT(), handler.GetTablesHandler)
		tables.GET("/:id", middleware.JWT(), handler.GetTableByIDHandler)
		tables.POST("", middleware.JWT(), handler.CreateTableHandler)
		tables.PUT("/:id", middleware.JWT(), handler.UpdateTableHandler)
		tables.DELETE("/:id", middleware.JWT(), handler.DeleteTableHandler)
	}
}
