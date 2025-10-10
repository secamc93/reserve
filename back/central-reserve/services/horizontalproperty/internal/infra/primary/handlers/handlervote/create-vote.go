package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// CreateVote godoc
// @Summary Registrar un voto
// @Description Registra el voto de un residente para una votación específica
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_id path int true "ID de la votación"
// @Param vote body request.CreateVoteRequest true "Datos del voto"
// @Success 201 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/votes [post]
func (h *VotingHandler) CreateVote(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateVoteDTO{
		VotingID:       uint(id64),
		ResidentID:     req.ResidentID,
		VotingOptionID: req.VotingOptionID,
		IPAddress:      req.IPAddress,
		UserAgent:      req.UserAgent,
		Notes:          req.Notes,
	}
	created, err := h.votingUseCase.CreateVote(c.Request.Context(), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo registrar el voto", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVoteDTOToResponse(created)
	c.JSON(http.StatusCreated, response.VoteSuccess{Success: true, Message: "Voto registrado", Data: responseData})
}
