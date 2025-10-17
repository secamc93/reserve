package handlerattendance

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes - Registrar rutas de asistencia
func (h *AttendanceHandler) RegisterRoutes(router *gin.RouterGroup) {
	attendance := router.Group("/attendance")
	{
		// Listas de asistencia
		attendance.POST("/lists", h.CreateAttendanceList)
		attendance.GET("/lists", h.ListAttendanceLists)
		attendance.GET("/lists/:id", h.GetAttendanceListByID)
		attendance.PUT("/lists/:id", h.UpdateAttendanceList)
		attendance.DELETE("/lists/:id", h.DeleteAttendanceList)
		attendance.POST("/lists/generate", h.GenerateAttendanceList)

		// Apoderados
		attendance.POST("/proxies", h.CreateProxy)
		attendance.GET("/proxies", h.ListProxies)
		attendance.GET("/proxies/:id", h.GetProxyByID)
		attendance.PUT("/proxies/:id", h.UpdateProxy)
		attendance.DELETE("/proxies/:id", h.DeleteProxy)
		attendance.GET("/proxies/unit/:unit_id", h.GetProxiesByPropertyUnit)

		// Registros de asistencia
		attendance.POST("/records", h.CreateAttendanceRecord)
		attendance.GET("/records", h.ListAttendanceRecords)
		attendance.GET("/records/:id", h.GetAttendanceRecordByID)
		attendance.PUT("/records/:id", h.UpdateAttendanceRecord)
		attendance.DELETE("/records/:id", h.DeleteAttendanceRecord)
		attendance.POST("/records/mark", h.MarkAttendance)
		attendance.POST("/records/:id/verify", h.VerifyAttendance)

		// Exportación
		attendance.GET("/lists/:id/export-excel", h.ExportAttendanceExcel)

		// Resúmenes y estadísticas
		attendance.GET("/lists/:id/summary", h.GetAttendanceSummary)
		attendance.GET("/lists/:id/records", h.GetAttendanceRecordsByList)
	}
}
