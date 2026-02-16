package handlervotes

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/vote/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateBulkVotes godoc
// @Summary Votación masiva
// @Description Registra múltiples votos para diferentes unidades con la misma opción
// @Tags votes
// @Accept json
// @Produce json
// @Param voting_id path int true "ID de la votación"
// @Param body body request.CreateBulkVotesRequest true "Datos de votación masiva"
// @Success 201 {object} response.BulkVoteSuccess
// @Failure 400 {object} response.ErrorResponse
// @Router /horizontal-properties/voting-groups/{group_id}/votings/{voting_id}/votes/bulk [post]
func (h *VotesHandler) CreateBulkVotes(c *gin.Context) {
	votingIDStr := c.Param("voting_id")
	votingID, err := strconv.ParseUint(votingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de votación inválido",
			Error:   err.Error(),
		})
		return
	}

	var req request.CreateBulkVotesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de request inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateBulkVotesDTO{
		VotingID:           uint(votingID),
		PropertyUnitIDs:    req.PropertyUnitIDs,
		VotingOptionID:     req.VotingOptionID,
		AutoMarkAttendance: req.AutoMarkAttendance,
		IPAddress:          req.IPAddress,
		UserAgent:          req.UserAgent,
		Notes:              req.Notes,
	}

	result, err := h.votingUseCase.CreateBulkVotes(c.Request.Context(), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Error en votación masiva",
			Error:   err.Error(),
		})
		return
	}

	resultResponse := mappers.MapBulkVoteResultDTOToResponse(result)

	c.JSON(http.StatusCreated, response.BulkVoteSuccess{
		Success: true,
		Message: formatBulkMessage(result.Succeeded, result.Failed),
		Data:    resultResponse,
	})
}

func formatBulkMessage(succeeded, failed int) string {
	msg := "Votación masiva completada: "
	msg += strconv.Itoa(succeeded) + " exitosos"
	if failed > 0 {
		msg += ", " + strconv.Itoa(failed) + " fallidos"
	}
	return msg
}
