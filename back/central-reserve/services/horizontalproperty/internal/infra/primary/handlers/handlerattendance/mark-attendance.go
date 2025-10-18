package handlerattendance

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// MarkAttendance godoc
//
//	@Summary		Marcar asistencia
//	@Description	Marca la asistencia de un registro por ID
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID del registro de asistencia"
//	@Success		200	{object}	object
//	@Failure		400	{object}	object
//	@Failure		500	{object}	object
//	@Router			/attendance/records/{id}/mark [post]
func (h *AttendanceHandler) MarkAttendance(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID requerido",
			Error:   "id es obligatorio",
		})
		return
	}

	recordID := parseUint(idStr)
	if recordID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "id debe ser un número válido",
		})
		return
	}

	// Marcar asistencia (solo marcar como asistido)
	updated, err := h.attendanceUseCase.MarkAttendanceSimple(c.Request.Context(), recordID, true)
	if err != nil {
		h.logger.Error().Err(err).Uint("record_id", recordID).Msg("Error marcando asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error marcando asistencia",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	responseData := response.AttendanceRecordResponse{
		ID:                updated.ID,
		AttendanceListID:  updated.AttendanceListID,
		PropertyUnitID:    updated.PropertyUnitID,
		ResidentID:        updated.ResidentID,
		ProxyID:           updated.ProxyID,
		AttendedAsOwner:   updated.AttendedAsOwner,
		AttendedAsProxy:   updated.AttendedAsProxy,
		Signature:         updated.Signature,
		SignatureDate:     updated.SignatureDate,
		SignatureMethod:   updated.SignatureMethod,
		VerifiedBy:        updated.VerifiedBy,
		VerificationDate:  updated.VerificationDate,
		VerificationNotes: updated.VerificationNotes,
		Notes:             updated.Notes,
		IsValid:           updated.IsValid,
		CreatedAt:         updated.CreatedAt,
		UpdatedAt:         updated.UpdatedAt,
		ResidentName:      updated.ResidentName,
		ProxyName:         updated.ProxyName,
		UnitNumber:        updated.UnitNumber,
	}

	h.logger.Info().Uint("record_id", recordID).Msg("Asistencia marcada exitosamente")

	c.JSON(http.StatusOK, response.AttendanceRecordSuccess{
		Success: true,
		Message: "Asistencia marcada exitosamente",
		Data:    responseData,
	})
}

// UnmarkAttendance godoc
//
//	@Summary		Desmarcar asistencia
//	@Description	Desmarca la asistencia de un registro por ID
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			id	path	uint	true	"ID del registro de asistencia"
//	@Success		200	{object}	object
//	@Failure		400	{object}	object
//	@Failure		500	{object}	object
//	@Router			/attendance/records/{id}/unmark [post]
func (h *AttendanceHandler) UnmarkAttendance(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID requerido",
			Error:   "id es obligatorio",
		})
		return
	}

	recordID := parseUint(idStr)
	if recordID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "id debe ser un número válido",
		})
		return
	}

	// Desmarcar asistencia
	updated, err := h.attendanceUseCase.MarkAttendanceSimple(c.Request.Context(), recordID, false)
	if err != nil {
		h.logger.Error().Err(err).Uint("record_id", recordID).Msg("Error desmarcando asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error desmarcando asistencia",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	responseData := response.AttendanceRecordResponse{
		ID:                updated.ID,
		AttendanceListID:  updated.AttendanceListID,
		PropertyUnitID:    updated.PropertyUnitID,
		ResidentID:        updated.ResidentID,
		ProxyID:           updated.ProxyID,
		AttendedAsOwner:   updated.AttendedAsOwner,
		AttendedAsProxy:   updated.AttendedAsProxy,
		Signature:         updated.Signature,
		SignatureDate:     updated.SignatureDate,
		SignatureMethod:   updated.SignatureMethod,
		VerifiedBy:        updated.VerifiedBy,
		VerificationDate:  updated.VerificationDate,
		VerificationNotes: updated.VerificationNotes,
		Notes:             updated.Notes,
		IsValid:           updated.IsValid,
		CreatedAt:         updated.CreatedAt,
		UpdatedAt:         updated.UpdatedAt,
		ResidentName:      updated.ResidentName,
		ProxyName:         updated.ProxyName,
		UnitNumber:        updated.UnitNumber,
	}

	h.logger.Info().Uint("record_id", recordID).Msg("Asistencia desmarcada exitosamente")

	c.JSON(http.StatusOK, response.AttendanceRecordSuccess{
		Success: true,
		Message: "Asistencia desmarcada exitosamente",
		Data:    responseData,
	})
}

// parseUint helper
func parseUint(s string) uint {
	var out uint
	if v, err := strconv.ParseUint(s, 10, 32); err == nil {
		out = uint(v)
	}
	return out
}
