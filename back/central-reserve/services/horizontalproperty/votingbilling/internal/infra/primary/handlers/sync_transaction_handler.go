package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SyncTransaction godoc
//
//	@Summary		Confirmar una compra de días al volver del pago
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query		int					false	"Obligatorio para super admin"
//	@Param			body		body		request.SyncRequest	true	"Id de la transacción de Wompi"
//	@Success		200			{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/days/sync [post]
func (h *handler) SyncTransaction(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	var req request.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	cov, err := h.useCase.SyncTransaction(c.Request.Context(), businessID, req.TransactionID, time.Now())
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Pago confirmado con la pasarela", Data: mappers.ToCoverage(cov)})
}
