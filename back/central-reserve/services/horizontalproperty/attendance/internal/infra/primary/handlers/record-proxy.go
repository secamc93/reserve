package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/attendance/internal/domain"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// AssignRecordProxy godoc
//
//	@Summary		Asignar apoderado a un registro de asistencia
//	@Description	Crea o edita el apoderado que asiste por la unidad en esta lista y la marca presente como apoderado. El apoderado queda solo en esta lista.
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id			path		uint								true	"ID del registro de asistencia"
//	@Param			business_id	query		uint								false	"Opcional para super admin"
//	@Param			request		body		request.AssignRecordProxyRequest	true	"Apoderado"
//	@Success		200			{object}	response.AttendanceRecordSuccess
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/attendance/records/{id}/proxy [put]
func (h *AttendanceHandler) AssignRecordProxy(c *gin.Context) {
	recordID, scope, ok := h.recordProxyParams(c)
	if !ok {
		return
	}
	var req request.AssignRecordProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	updated, err := h.attendanceUseCase.AssignRecordProxy(c.Request.Context(), scope, recordID, req.ProxyName, req.ProxyDni)
	if err != nil {
		h.recordProxyError(c, recordID, err)
		return
	}
	c.JSON(http.StatusOK, response.AttendanceRecordSuccess{
		Success: true,
		Message: "Apoderado asignado",
		Data:    mappers.MapAttendanceRecordDTOToResponse(*updated),
	})
}

// RemoveRecordProxy godoc
//
//	@Summary		Quitar apoderado de un registro de asistencia
//	@Description	Quita el apoderado de la unidad en esta lista; la unidad queda sin asistencia.
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Produce		json
//	@Param			id			path		uint	true	"ID del registro de asistencia"
//	@Param			business_id	query		uint	false	"Opcional para super admin"
//	@Success		200			{object}	response.AttendanceRecordSuccess
//	@Failure		400			{object}	response.ErrorResponse
//	@Failure		404			{object}	response.ErrorResponse
//	@Failure		500			{object}	response.ErrorResponse
//	@Router			/attendance/records/{id}/proxy [delete]
func (h *AttendanceHandler) RemoveRecordProxy(c *gin.Context) {
	recordID, scope, ok := h.recordProxyParams(c)
	if !ok {
		return
	}
	updated, err := h.attendanceUseCase.RemoveRecordProxy(c.Request.Context(), scope, recordID)
	if err != nil {
		h.recordProxyError(c, recordID, err)
		return
	}
	c.JSON(http.StatusOK, response.AttendanceRecordSuccess{
		Success: true,
		Message: "Apoderado quitado",
		Data:    mappers.MapAttendanceRecordDTOToResponse(*updated),
	})
}

// recordProxyParams lee el ID del registro y la propiedad a la que se restringe la operación:
// la del token para usuarios normales; para el super admin, ?business_id o 0 (sin restricción).
func (h *AttendanceHandler) recordProxyParams(c *gin.Context) (uint, uint, bool) {
	recordID := parseUint(c.Param("id"))
	if recordID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID inválido", Error: "id debe ser un número válido"})
		return 0, 0, false
	}
	if middleware.IsSuperAdmin(c) {
		if q := c.Query("business_id"); q != "" {
			bid, err := strconv.ParseUint(q, 10, 32)
			if err != nil || bid == 0 {
				c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "debe ser numérico y > 0"})
				return 0, 0, false
			}
			return recordID, uint(bid), true
		}
		return recordID, 0, true
	}
	bid, ok := middleware.GetBusinessID(c)
	if !ok || bid == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no disponible en el token"})
		return 0, 0, false
	}
	return recordID, bid, true
}

func (h *AttendanceHandler) recordProxyError(c *gin.Context, recordID uint, err error) {
	switch {
	case errors.Is(err, domain.ErrAttendanceRecordNotFound):
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: "Registro de asistencia no encontrado", Error: err.Error()})
	case errors.Is(err, domain.ErrProxyNameRequired):
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Nombre del apoderado requerido", Error: err.Error()})
	default:
		h.logger.Error().Err(err).Uint("record_id", recordID).Msg("Error actualizando apoderado del registro")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error actualizando apoderado", Error: err.Error()})
	}
}
