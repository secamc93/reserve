package handlerattendance

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlerattendance/response"

	"github.com/gin-gonic/gin"
)

// GenerateAttendanceList godoc
//
//	@Summary		Generar lista de asistencia automáticamente
//	@Description	Genera una lista de asistencia automáticamente para un grupo de votación con todas las unidades
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			voting_group_id	query		uint	true	"ID del grupo de votación"
//	@Success		201			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/attendance/lists/generate [post]
func (h *AttendanceHandler) GenerateAttendanceList(c *gin.Context) {
	votingGroupIDStr := c.Query("voting_group_id")
	if votingGroupIDStr == "" {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID del grupo de votación requerido",
			Error:   "El parámetro voting_group_id es obligatorio",
		})
		return
	}

	votingGroupID, err := strconv.ParseUint(votingGroupIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de grupo de votación inválido",
			Error:   "Debe ser un número válido",
		})
		return
	}

	// Generar lista de asistencia
	created, err := h.attendanceUseCase.GenerateAttendanceList(c.Request.Context(), uint(votingGroupID))
	if err != nil {
		h.logger.Error().Err(err).
			Uint("voting_group_id", uint(votingGroupID)).
			Msg("Error generando lista de asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error generando lista de asistencia",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	responseData := response.AttendanceListResponse{
		ID:              created.ID,
		VotingGroupID:   created.VotingGroupID,
		Title:           created.Title,
		Description:     created.Description,
		IsActive:        created.IsActive,
		CreatedByUserID: created.CreatedByUserID,
		Notes:           created.Notes,
		CreatedAt:       created.CreatedAt,
		UpdatedAt:       created.UpdatedAt,
	}

	h.logger.Info().
		Uint("attendance_list_id", created.ID).
		Uint("voting_group_id", uint(votingGroupID)).
		Msg("Lista de asistencia generada exitosamente")

	c.JSON(http.StatusCreated, response.AttendanceListSuccess{
		Success: true,
		Message: "Lista de asistencia generada exitosamente",
		Data:    responseData,
	})
}
