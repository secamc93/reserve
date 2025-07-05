package tablehandler

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de mesas
func RegisterRoutes(v1Group *gin.RouterGroup, handler ITableHandler) {
	// Crear el subgrupo /tables dentro de /api/v1
	tables := v1Group.Group("/tables")
	{
		tables.GET("", handler.GetTablesHandler)
		tables.GET("/:id", handler.GetTableByIDHandler)
		tables.POST("", handler.CreateTableHandler)
		tables.PUT("/:id", handler.UpdateTableHandler)
		tables.DELETE("/:id", handler.DeleteTableHandler)
	}
}
