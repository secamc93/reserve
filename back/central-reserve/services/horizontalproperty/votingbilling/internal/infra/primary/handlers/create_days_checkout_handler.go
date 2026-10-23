package handlers

import (
	"net/http"
	"time"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateDaysCheckout godoc
//
//	@Summary		Comprar días de votación
//	@Description	Crea un pago pendiente por las fechas que no estén cubiertas y devuelve el enlace de Wompi
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query		int							false	"Obligatorio para super admin"
//	@Param			body		body		request.DaysCheckoutRequest	true	"Fechas (AAAA-MM-DD) y URL de retorno"
//	@Success		201			{object}	response.Success
//	@Failure		409			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-billing/days/checkout [post]
func (h *handler) CreateDaysCheckout(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	var req request.DaysCheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	out, err := h.useCase.CreateDaysCheckout(c.Request.Context(), dtos.DaysCheckoutRequest{
		BusinessID: businessID, Dates: req.Dates, UserID: userID(c), RedirectURL: req.RedirectURL, Now: time.Now(),
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Pago iniciado", Data: response.Checkout{Payment: mappers.ToDayPayment(out.Payment), CheckoutURL: out.CheckoutURL}})
}
