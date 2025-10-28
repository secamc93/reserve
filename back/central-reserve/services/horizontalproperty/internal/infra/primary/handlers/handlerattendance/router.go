package handlerattendance

import (
	"central_reserve/services/auth/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes - Registrar rutas de asistencia
func (h *AttendanceHandler) RegisterRoutes(router *gin.RouterGroup) {
	attendance := router.Group("/attendance")
	{
		// Listas de asistencia
		attendance.POST("/lists", middleware.JWT(), h.CreateAttendanceList)
		attendance.GET("/lists", middleware.JWT(), h.ListAttendanceLists)
		attendance.GET("/lists/:id", middleware.JWT(), h.GetAttendanceListByID)
		attendance.PUT("/lists/:id", middleware.JWT(), h.UpdateAttendanceList)
		attendance.DELETE("/lists/:id", middleware.JWT(), h.DeleteAttendanceList)
		attendance.POST("/lists/generate", middleware.JWT(), h.GenerateAttendanceList)

		// Apoderados
		attendance.POST("/proxies", middleware.JWT(), h.CreateProxy)
		attendance.GET("/proxies", middleware.JWT(), h.ListProxies)
		attendance.GET("/proxies/:id", middleware.JWT(), h.GetProxyByID)
		attendance.PUT("/proxies/:id", middleware.JWT(), h.UpdateProxy)
		attendance.DELETE("/proxies/:id", middleware.JWT(), h.DeleteProxy)
		attendance.GET("/proxies/unit/:unit_id", middleware.JWT(), h.GetProxiesByPropertyUnit)

		// Registros de asistencia
		attendance.POST("/records", middleware.JWT(), h.CreateAttendanceRecord)
		attendance.GET("/records", middleware.JWT(), h.ListAttendanceRecords)
		attendance.GET("/records/:id", middleware.JWT(), h.GetAttendanceRecordByID)
		attendance.PUT("/records/:id", middleware.JWT(), h.UpdateAttendanceRecord)
		attendance.DELETE("/records/:id", middleware.JWT(), h.DeleteAttendanceRecord)
		attendance.POST("/records/:id/mark", middleware.JWT(), h.MarkAttendance)
		attendance.POST("/records/:id/unmark", middleware.JWT(), h.UnmarkAttendance)
		attendance.POST("/records/:id/verify", middleware.JWT(), h.VerifyAttendance)

		// Exportación
		attendance.GET("/lists/:id/export-excel", middleware.JWT(), h.ExportAttendanceExcel)
		attendance.GET("/lists/:id/export-detailed-excel", middleware.JWT(), h.ExportAttendanceExcelDetailed)

		// Resúmenes y estadísticas
		attendance.GET("/lists/:id/summary", middleware.JWT(), h.GetAttendanceSummary)
		attendance.GET("/lists/:id/records", middleware.JWT(), h.GetAttendanceRecordsByList)

	}
}
