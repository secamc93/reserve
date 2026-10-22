package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// GetStatus godoc
//
//	@Summary		Estado de cobro de un grupo de votación
//	@Description	Días de votación requeridos, pagados y pendientes, monto a pagar y si la propiedad está exenta
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Produce		json
//	@Param			group_id	path		int	true	"ID del grupo de votación"
//	@Param			business_id	query		int	false	"Obligatorio para super admin"
//	@Success		200			{object}	response.Success
//	@Failure		404			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/payment [get]
func (h *handler) GetStatus(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	groupID, ok := groupIDParam(c)
	if !ok {
		return
	}
	st, err := h.useCase.GetStatus(c.Request.Context(), businessID, groupID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Estado de cobro obtenido", Data: mappers.ToBillingStatus(st)})
}
