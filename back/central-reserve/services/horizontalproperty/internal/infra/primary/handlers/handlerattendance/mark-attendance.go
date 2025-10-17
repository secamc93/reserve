package handlerattendance

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// MarkAttendance godoc
//
//	@Summary		Marcar asistencia
//	@Description	Marca la asistencia de una unidad en una lista de asistencia
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		request.MarkAttendanceRequest	true	"Datos de la asistencia"
//	@Success		201		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/records/mark [post]
func (h *AttendanceHandler) MarkAttendance(c *gin.Context) {
	var req request.MarkAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Marcar asistencia
	// Marcar sin amarrar FK a residente/apoderado (solo marcar asistencia)
	var nilResidentID *uint = nil
	var nilProxyID *uint = nil
	created, err := h.attendanceUseCase.MarkAttendance(
		c.Request.Context(),
		req.AttendanceListID,
		req.PropertyUnitID,
		nilResidentID,
		nilProxyID,
		req.AttendedAsOwner,
		req.AttendedAsProxy,
		req.Signature,
		req.SignatureMethod,
	)
	if err != nil {
		h.logger.Error().Err(err).
			Uint("attendance_list_id", req.AttendanceListID).
			Uint("property_unit_id", req.PropertyUnitID).
			Msg("Error marcando asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error marcando asistencia",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	responseData := response.AttendanceRecordResponse{
		ID:                created.ID,
		AttendanceListID:  created.AttendanceListID,
		PropertyUnitID:    created.PropertyUnitID,
		ResidentID:        created.ResidentID,
		ProxyID:           created.ProxyID,
		AttendedAsOwner:   created.AttendedAsOwner,
		AttendedAsProxy:   created.AttendedAsProxy,
		Signature:         created.Signature,
		SignatureDate:     created.SignatureDate,
		SignatureMethod:   created.SignatureMethod,
		VerifiedBy:        created.VerifiedBy,
		VerificationDate:  created.VerificationDate,
		VerificationNotes: created.VerificationNotes,
		Notes:             created.Notes,
		IsValid:           created.IsValid,
		CreatedAt:         created.CreatedAt,
		UpdatedAt:         created.UpdatedAt,
	}

	h.logger.Info().
		Uint("record_id", created.ID).
		Uint("attendance_list_id", req.AttendanceListID).
		Uint("property_unit_id", req.PropertyUnitID).
		Msg("Asistencia marcada exitosamente")

	c.JSON(http.StatusCreated, response.AttendanceRecordSuccess{
		Success: true,
		Message: "Asistencia marcada exitosamente",
		Data:    responseData,
	})
}
