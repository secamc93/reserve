package actions

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del handler de Action
func RegisterRoutes(router *gin.RouterGroup, handler IActionHandler, logger log.ILogger) {
	actions := router.Group("/actions")

	// Rutas de Action CRUD
	actions.GET("", middleware.JWT(), handler.GetActionsHandler)
	actions.GET("/:id", middleware.JWT(), handler.GetActionByIDHandler)
	actions.POST("", middleware.JWT(), handler.CreateActionHandler)
	actions.PUT("/:id", middleware.JWT(), handler.UpdateActionHandler)
	actions.DELETE("/:id", middleware.JWT(), handler.DeleteActionHandler)
}
