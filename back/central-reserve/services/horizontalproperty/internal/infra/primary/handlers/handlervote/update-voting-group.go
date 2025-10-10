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

// UpdateVotingGroup godoc
// @Summary Actualizar un grupo de votación
// @Description Actualiza los datos de un grupo de votación existente
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_group body request.CreateVotingGroupRequest true "Datos actualizados del grupo"
// @Success 200 {object} object
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id} [put]
func (h *VotingHandler) UpdateVotingGroup(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVotingGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateVotingGroupDTO{
		Name:             req.Name,
		Description:      req.Description,
		VotingStartDate:  req.VotingStartDate,
		VotingEndDate:    req.VotingEndDate,
		RequiresQuorum:   req.RequiresQuorum,
		QuorumPercentage: req.QuorumPercentage,
		Notes:            req.Notes,
	}
	updated, err := h.votingUseCase.UpdateVotingGroup(c.Request.Context(), uint(id64), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo actualizar", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVotingGroupDTOToResponse(updated)
	c.JSON(http.StatusOK, response.VotingGroupSuccess{Success: true, Message: "Grupo actualizado", Data: responseData})
}
