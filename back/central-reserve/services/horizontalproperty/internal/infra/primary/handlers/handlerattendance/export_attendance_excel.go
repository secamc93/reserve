package handlerattendance

import (
	"fmt"
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// ExportAttendanceExcelDetailed godoc
//
//	@Summary		Exportar asistencia detallada a Excel
//	@Description	Genera un Excel con columnas: Unidad, Nombre, Coeficiente, Apoderado, Asistencia. Incluye título con fecha de descarga.
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//	@Param			id	path		uint	true	"ID de la lista"
//	@Success		200		{file}  binary
//	@Failure		400		{object} object
//	@Failure		500		{object} object
//	@Router			/attendance/lists/{id}/export-detailed-excel [get]
func (h *AttendanceHandler) ExportAttendanceExcelDetailed(c *gin.Context) {
	id := parseUint(c.Param("id"))
	if id == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "id debe ser un número válido"})
		return
	}

	// Obtener registros de asistencia
	records, err := h.attendanceUseCase.GetAttendanceRecordsByList(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo registros", Error: err.Error()})
		return
	}

	// Obtener título del grupo de votación
	title, err := h.attendanceUseCase.GetVotingGroupTitleByListID(c.Request.Context(), id)
	if err != nil {
		title = "Lista de Asistencia" // Título por defecto
	}

	// Obtener resumen de asistencia
	summary, err := h.attendanceUseCase.GetAttendanceSummary(c.Request.Context(), id)
	if err != nil {
		// Si hay error, continuar sin resumen
		summary = nil
	}

	// Configurar headers para descarga de Excel
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=asistencia_detallada_%d.xlsx", id))

	// Generar CSV simple (compatible Excel) por rapidez
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=asistencia_detallada_%d.csv", id))

	// BOM UTF-8 para caracteres especiales
	c.Writer.Write([]byte("\xEF\xBB\xBF"))

	// Título con fecha de descarga
	fechaDescarga := time.Now().Format("02/01/2006 15:04:05")
	c.Writer.Write([]byte(fmt.Sprintf("REPORTE DE ASISTENCIA - %s\n", title)))
	c.Writer.Write([]byte(fmt.Sprintf("Fecha de descarga: %s\n", fechaDescarga)))

	// Agregar resumen de porcentajes si está disponible
	if summary != nil {
		c.Writer.Write([]byte("\n"))
		c.Writer.Write([]byte("RESUMEN DE ASISTENCIA:\n"))
		c.Writer.Write([]byte(fmt.Sprintf("Total de unidades: %d\n", summary.TotalUnits)))
		c.Writer.Write([]byte(fmt.Sprintf("Unidades presentes: %d (%.2f%%)\n", summary.AttendedUnits, summary.AttendanceRate)))
		c.Writer.Write([]byte(fmt.Sprintf("Unidades ausentes: %d (%.2f%%)\n", summary.AbsentUnits, summary.AbsenceRate)))
		c.Writer.Write([]byte(fmt.Sprintf("Presentes como propietario: %d\n", summary.AttendedAsOwner)))
		c.Writer.Write([]byte(fmt.Sprintf("Presentes como apoderado: %d\n", summary.AttendedAsProxy)))
		c.Writer.Write([]byte(fmt.Sprintf("Asistencia por coeficiente: %.3f%%\n", summary.AttendanceRateByCoef)))
		c.Writer.Write([]byte(fmt.Sprintf("Ausencia por coeficiente: %.3f%%\n", summary.AbsenceRateByCoef)))
	}

	c.Writer.Write([]byte("\n"))

	// Encabezados
	c.Writer.Write([]byte("Unidad,Nombre,Coeficiente,Apoderado,Asistencia\n"))

	// Filas de datos
	for _, r := range records {
		unidad := r.UnitNumber
		nombre := r.ResidentName

		// Usar coeficiente como string directamente
		coeficiente := r.ParticipationCoefficient
		if coeficiente == "" {
			coeficiente = "0.000000"
		}

		// Log para debug
		fmt.Printf("DEBUG: Unidad %s, Coeficiente: %s\n", unidad, coeficiente)

		apoderado := r.ProxyName
		asistencia := "No"

		// Determinar si asistió (basado en attended_as_owner o attended_as_proxy)
		if r.AttendedAsOwner || r.AttendedAsProxy {
			asistencia = "Sí"
		}

		// Si no hay nombre de residente, usar "Sin asignar"
		if nombre == "" {
			nombre = "Sin asignar"
		}

		// Si no hay apoderado, dejar vacío
		if apoderado == "" {
			apoderado = ""
		}

		line := fmt.Sprintf("%s,%s,%s,%s,%s\n", unidad, nombre, coeficiente, apoderado, asistencia)
		c.Writer.Write([]byte(line))
	}
}
