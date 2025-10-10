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

// CreateVotingOption godoc
// @Summary Crear una opción de votación
// @Description Crea una nueva opción para una votación específica
// @Tags Votaciones
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param group_id path int true "ID del grupo de votación"
// @Param voting_id path int true "ID de la votación"
// @Param option body request.CreateVotingOptionRequest true "Datos de la opción de votación"
// @Success 201 {object} object
// @Failure 400 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id}/voting-groups/{group_id}/votings/{voting_id}/options [post]
func (h *VotingHandler) CreateVotingOption(c *gin.Context) {
	idParam := c.Param("voting_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVotingOptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateVotingOptionDTO{
		VotingID:     uint(id64),
		OptionText:   req.OptionText,
		OptionCode:   req.OptionCode,
		DisplayOrder: req.DisplayOrder,
	}
	created, err := h.votingUseCase.CreateVotingOption(c.Request.Context(), dto)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo crear la opción", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVotingOptionDTOToResponse(created)
	c.JSON(http.StatusCreated, response.VotingOptionSuccess{Success: true, Message: "Opción creada", Data: responseData})
}
