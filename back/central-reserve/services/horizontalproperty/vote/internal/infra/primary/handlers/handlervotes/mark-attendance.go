package handlervotes

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// MarkUnitAttendance godoc
//
//	@Summary		Marcar/desmarcar asistencia de unidad
//	@Description	Marca o desmarca la asistencia de una unidad para una votación específica
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id		path		int								true	"ID del grupo de votación"
//	@Param			voting_id		path		int								true	"ID de la votación"
//	@Param			unit_id			path		int								true	"ID de la unidad"
//	@Param			attendance		body		request.MarkAttendanceRequest	true	"Datos de asistencia"
//	@Success		200				{object}	object
//	@Failure		400				{object}	object
//	@Failure		500				{object}	object
//	@Router			/horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/units/{unit_id}/attendance [put]
func (h *VotesHandler) MarkUnitAttendance(c *gin.Context) {
	// Parsear voting_id
	votingIDParam := c.Param("voting_id")
	votingID64, err := strconv.ParseUint(votingIDParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("voting_id", votingIDParam).Msg("Error parseando ID de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "voting_id inválido", Error: "Debe ser numérico"})
		return
	}

	// Parsear unit_id
	unitIDParam := c.Param("unit_id")
	unitID64, err := strconv.ParseUint(unitIDParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("unit_id", unitIDParam).Msg("Error parseando ID de unidad")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "unit_id inválido", Error: "Debe ser numérico"})
		return
	}

	// Parsear request body
	var req request.MarkAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	votingID := uint(votingID64)
	unitID := uint(unitID64)

	h.logger.Info().
		Uint("voting_id", votingID).
		Uint("property_unit_id", unitID).
		Bool("mark_attendance", req.MarkAttendance).
		Msg("Marcando asistencia de unidad")

	// Llamar al use case
	if err := h.votingUseCase.MarkUnitAttendance(c.Request.Context(), votingID, unitID, req.MarkAttendance); err != nil {
		h.logger.Error().
			Err(err).
			Uint("voting_id", votingID).
			Uint("property_unit_id", unitID).
			Bool("mark_attendance", req.MarkAttendance).
			Msg("Error marcando asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error marcando asistencia", Error: err.Error()})
		return
	}

	h.logger.Info().
		Uint("voting_id", votingID).
		Uint("property_unit_id", unitID).
		Bool("mark_attendance", req.MarkAttendance).
		Msg("✅ Asistencia marcada exitosamente")

	message := "Asistencia marcada"
	if !req.MarkAttendance {
		message = "Asistencia desmarcada"
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": message})
}
