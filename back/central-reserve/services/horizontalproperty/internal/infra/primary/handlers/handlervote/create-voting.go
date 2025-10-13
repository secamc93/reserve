package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"

	"github.com/gin-gonic/gin"
)

// CreateVoting godoc
//
//	@Summary		Crear una nueva votación
//	@Description	Crea una nueva votación dentro de un grupo de votación
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			hp_id		path		int							true	"ID de la propiedad horizontal"
//	@Param			group_id	path		int							true	"ID del grupo de votación"
//	@Param			voting		body		request.CreateVotingRequest	true	"Datos de la votación"
//	@Success		201			{object}	object
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties/{hp_id}/voting-groups/{group_id}/votings [post]
func (h *VotingHandler) CreateVoting(c *gin.Context) {
	idParam := c.Param("group_id")
	id64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-voting.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Str("group_id", idParam).Msg("Error parseando ID de grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "id inválido", Error: "Debe ser numérico"})
		return
	}
	var req request.CreateVotingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-voting.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", uint(id64)).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	dto := domain.CreateVotingDTO{
		VotingGroupID:      uint(id64),
		Title:              req.Title,
		Description:        req.Description,
		VotingType:         req.VotingType,
		IsSecret:           req.IsSecret,
		AllowAbstention:    req.AllowAbstention,
		DisplayOrder:       req.DisplayOrder,
		RequiredPercentage: req.RequiredPercentage,
	}
	created, err := h.votingUseCase.CreateVoting(c.Request.Context(), dto)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-voting.go - Error en handler: %v\n", err)
		h.logger.Error().Err(err).Uint("group_id", uint(id64)).Str("title", req.Title).Msg("Error creando votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo crear la votación", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVotingDTOToResponse(created)
	c.JSON(http.StatusCreated, response.VotingSuccess{Success: true, Message: "Votación creada", Data: responseData})
}
