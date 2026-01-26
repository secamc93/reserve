package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/attendance/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateAttendanceList godoc
//
//	@Summary		Crear lista de asistencia
//	@Description	Crea una nueva lista de asistencia para un grupo de votación
//	@Tags			Asistencia
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			request	body		request.CreateAttendanceListRequest	true	"Datos de la lista de asistencia"
//	@Success		201		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/attendance/lists [post]
func (h *AttendanceHandler) CreateAttendanceList(c *gin.Context) {
	var req request.CreateAttendanceListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Convertir request a DTO
	dto := mappers.MapCreateAttendanceListRequestToDTO(req)

	// Crear lista de asistencia
	created, err := h.attendanceUseCase.CreateAttendanceList(c.Request.Context(), dto)
	if err != nil {
		h.logger.Error().Err(err).
			Uint("voting_group_id", req.VotingGroupID).
			Msg("Error creando lista de asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando lista de asistencia",
			Error:   err.Error(),
		})
		return
	}

	// Mapear a response
	responseData := mappers.MapAttendanceListDTOToResponse(*created)

	h.logger.Info().
		Uint("attendance_list_id", created.ID).
		Uint("voting_group_id", req.VotingGroupID).
		Msg("Lista de asistencia creada exitosamente")

	c.JSON(http.StatusCreated, response.AttendanceListSuccess{
		Success: true,
		Message: "Lista de asistencia creada exitosamente",
		Data:    responseData,
	})
}
