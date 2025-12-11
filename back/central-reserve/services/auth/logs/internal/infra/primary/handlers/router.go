package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registra las rutas del módulo logs
func (h *handlers) RegisterRoutes(router *gin.RouterGroup, handler Ihandlers, logger log.ILogger) {
	logsGroup := router.Group("/logs")
	{
		// Usar middleware específico para logs que acepta tokens principales y business tokens
		logsGroup.GET("/stream", middleware.LogsAuth(), handler.StreamLogsHandler)
	}
}
