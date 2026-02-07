package handlers

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

func (h *AttendanceHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Rutas para registro de asistencia por sesión
	sessions := router.Group("/sport-training/sessions/:session_id/attendance")
	{
		sessions.POST("", middleware.JWT(), h.RecordAttendance)
		sessions.GET("", middleware.JWT(), h.ListBySession)
	}

	// Rutas para historial de asistencia por jugador
	players := router.Group("/sport-training/players/:player_id/attendance")
	{
		players.GET("", middleware.JWT(), h.ListByPlayer)
	}
}
