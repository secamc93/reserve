package horizontalpropertyhandler

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas para el handler de propiedades horizontales
func (h *HorizontalPropertyHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Grupo de rutas para propiedades horizontales
	horizontalProperties := router.Group("/horizontal-properties")
	{
		// CRUD básico
		horizontalProperties.POST("", h.CreateHorizontalProperty)              // POST /api/v1/horizontal-properties
		horizontalProperties.GET("", h.ListHorizontalProperties)               // GET /api/v1/horizontal-properties
		horizontalProperties.GET("/:hp_id", h.GetHorizontalPropertyByID)       // GET /api/v1/horizontal-properties/:hp_id
		horizontalProperties.GET("/code/:code", h.GetHorizontalPropertyByCode) // GET /api/v1/horizontal-properties/code/:code
		horizontalProperties.PUT("/:hp_id", h.UpdateHorizontalProperty)        // PUT /api/v1/horizontal-properties/:hp_id
		horizontalProperties.DELETE("/:hp_id", h.DeleteHorizontalProperty)     // DELETE /api/v1/horizontal-properties/:hp_id
	}
}
