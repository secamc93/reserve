package handlervote

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreateVotingGroup godoc
//
//	@Summary		Crear un nuevo grupo de votación
//	@Description	Crea un nuevo grupo de votación para una propiedad horizontal
//	@Tags			Votaciones
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			voting_group	body		request.CreateVotingGroupRequest	true	"Datos del grupo de votación"
//	@Success		201				{object}	object
//	@Failure		400				{object}	object
//	@Failure		500				{object}	object
//	@Router			/horizontal-properties/voting-groups [post]
func (h *VotingHandler) CreateVotingGroup(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateVotingGroup")

	var req request.CreateVotingGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Msg("Error validando datos del request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	var businessID uint
	isSuper := middleware.IsSuperAdmin(c)
	if isSuper {
		bidParam := c.Query("business_id")
		if bidParam == "" {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "Proporcione ?business_id"})
			return
		}
		bid64, err := strconv.ParseUint(bidParam, 10, 32)
		if err != nil || bid64 == 0 {
			h.logger.Error(ctx).Str("business_id", bidParam).Msg("Business ID inválido")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico y > 0"})
			return
		}
		businessID = uint(bid64)
	} else {
		bid, ok := middleware.GetBusinessID(c)
		if !ok || bid == 0 {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no encontrado"})
			return
		}
		businessID = bid
	}

	dto := domain.CreateVotingGroupDTO{
		BusinessID:       businessID,
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
		fmt.Fprintf(os.Stderr, "[ERROR] handlervote/create-voting-group.go - Error en handler: %v\n", err)
		h.logger.Error(ctx).Err(err).Uint("business_id", businessID).Str("name", req.Name).Msg("Error creando grupo de votación")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "No se pudo crear el grupo", Error: err.Error()})
		return
	}

	// Mapear DTO a response
	responseData := mapper.MapVotingGroupDTOToResponse(created)
	c.JSON(http.StatusCreated, response.VotingGroupSuccess{Success: true, Message: "Grupo de votación creado", Data: responseData})
}
