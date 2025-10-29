package handlervote

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/handlervote/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListVotingGroups godoc
//
//	@Summary		Listar grupos de votación
//	@Description	Obtiene la lista de grupos de votación de una propiedad horizontal
//	@Tags			Votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	object
//	@Failure		400		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/voting-groups [get]
func (h *VotingHandler) ListVotingGroups(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListVotingGroups")

	// Determinar business_id: del token para usuarios normales; query param opcional para super admin
	var businessID uint
	isSuper := middleware.IsSuperAdmin(c)
	if isSuper {
		q := c.Query("business_id")
		if q == "" {
			h.logger.Error(ctx).Msg("business_id requerido para super admin")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido", Error: "Proporcione ?business_id"})
			return
		}
		id64, err := strconv.ParseUint(q, 10, 32)
		if err != nil || id64 == 0 {
			h.logger.Error(ctx).Str("business_id", q).Msg("Business ID inválido")
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id inválido", Error: "Debe ser numérico y > 0"})
			return
		}
		businessID = uint(id64)
	} else {
		bid, ok := middleware.GetBusinessID(c)
		if !ok || bid == 0 {
			h.logger.Error(ctx).Msg("Business ID no disponible en token")
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "token inválido", Error: "business_id no encontrado"})
			return
		}
		businessID = bid
	}

	groups, err := h.votingUseCase.ListVotingGroupsByBusiness(ctx, businessID)
	if err != nil {
		h.logger.Error(ctx).Err(err).Uint("business_id", businessID).Msg("Error listando grupos de votación")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error listando grupos", Error: err.Error()})
		return
	}

	// Mapear DTOs a responses
	responseData := mapper.MapVotingGroupDTOsToResponses(groups)
	c.JSON(http.StatusOK, response.VotingGroupsSuccess{Success: true, Message: "Grupos obtenidos", Data: responseData})
}
