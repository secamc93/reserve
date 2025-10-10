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

// UpdateVoting godoc
// @Summary Actualizar una votación
// @Description Actualiza los datos de una votación existente
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_id path int true "ID de la votación"
// @Param voting body request.CreateVotingRequest true "Datos actualizados de la votación"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id} [put]
func (h *VotingHandler) UpdateVoting(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVotingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateVotingDTO{
		Title:              req.Title,
		Description:        req.Description,
		VotingType:         req.VotingType,
		IsSecret:           req.IsSecret,
		AllowAbstention:    req.AllowAbstention,
		DisplayOrder:       req.DisplayOrder,
		RequiredPercentage: req.RequiredPercentage,
	}
	updated, err := h.votingUseCase.UpdateVoting(c.Request.Context(), uint(id64), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo actualizar", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVotingDTOToResponse(updated)
	c.JSON(http.StatusOK, response.VotingSuccess{Success: true, Message: "Votación actualizada", Data: responseData})
}
