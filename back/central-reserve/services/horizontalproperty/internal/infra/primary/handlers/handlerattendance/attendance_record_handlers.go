package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

func (h *AttendanceHandler) CreateAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "CreateAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) ListAttendanceRecords(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "ListAttendanceRecords no implementado aún",
	})
}

func (h *AttendanceHandler) GetAttendanceRecordByID(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "GetAttendanceRecordByID no implementado aún",
	})
}

func (h *AttendanceHandler) UpdateAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "UpdateAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) DeleteAttendanceRecord(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "DeleteAttendanceRecord no implementado aún",
	})
}

func (h *AttendanceHandler) VerifyAttendance(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, response.ErrorResponse{
		Success: false,
		Message: "Funcionalidad en desarrollo",
		Error:   "VerifyAttendance no implementado aún",
	})
}
