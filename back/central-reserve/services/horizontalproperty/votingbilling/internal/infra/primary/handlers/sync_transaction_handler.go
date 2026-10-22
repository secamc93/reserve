package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SyncTransaction godoc
//
//	@Summary		Confirmar una transacción al volver del pago
//	@Description	Consulta la transacción en Wompi y actualiza el pago del grupo
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int					true	"ID del grupo de votación"
//	@Param			business_id	query		int					false	"Obligatorio para super admin"
//	@Param			body		body		request.SyncRequest	true	"Id de la transacción que devuelve Wompi"
//	@Success		200			{object}	response.Success
//	@Router			/horizontal-properties/voting-groups/{group_id}/payments/sync [post]
func (h *handler) SyncTransaction(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	groupID, ok := groupIDParam(c)
	if !ok {
		return
	}
	var req request.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	st, err := h.useCase.SyncTransaction(c.Request.Context(), businessID, groupID, req.TransactionID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Pago confirmado con la pasarela", Data: mappers.ToBillingStatus(st)})
}
