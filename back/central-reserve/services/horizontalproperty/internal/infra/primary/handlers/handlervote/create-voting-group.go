package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// CreateVotingGroup godoc
// @Summary Crear un nuevo grupo de votación
// @Description Crea un nuevo grupo de votación para una propiedad horizontal
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param voting_group body request.CreateVotingGroupRequest true "Datos del grupo de votación"
// @Success 201 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups [post]
func (h *VotingHandler) CreateVotingGroup(c *gin.Context) {
	var req request.CreateVotingGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	idParam := c.Param("hp_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}

	dto := domain.CreateVotingGroupDTO{
		BusinessID:       uint(id64),
		Name:             req.Name,
		Description:      req.Description,
		VotingStartDate:  req.VotingStartDate,
		VotingEndDate:    req.VotingEndDate,
		RequiresQuorum:   req.RequiresQuorum,
		QuorumPercentage: req.QuorumPercentage,
		CreatedByUserID:  req.CreatedByUserID,
		Notes:            req.Notes,
	}

	created, err := h.votingUseCase.CreateVotingGroup(c.Request.Context(), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo crear el grupo", Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, response.VotingGroupSuccess{Success: true, Message: "Grupo de votación creado", Data: *created})
}
