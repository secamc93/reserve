package horizontalpropertyhandler

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas para el handler de propiedades horizontales
func (h *HorizontalPropertyHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Grupo de rutas para propiedades horizontales
	horizontalProperties := router.Group("/horizontal-properties")
	{
		// CRUD básico
		horizontalProperties.POST("", middleware.JWT(), h.CreateHorizontalProperty)          // POST /api/v1/horizontal-properties
		horizontalProperties.GET("", middleware.JWT(), h.ListHorizontalProperties)           // GET /api/v1/horizontal-properties
		horizontalProperties.GET("/:hp_id", middleware.JWT(), h.GetHorizontalPropertyByID)   // GET /api/v1/horizontal-properties/:hp_id
		horizontalProperties.PUT("/:hp_id", middleware.JWT(), h.UpdateHorizontalProperty)    // PUT /api/v1/horizontal-properties/:hp_id
		horizontalProperties.DELETE("/:hp_id", middleware.JWT(), h.DeleteHorizontalProperty) // DELETE /api/v1/horizontal-properties/:hp_id
	}
}
