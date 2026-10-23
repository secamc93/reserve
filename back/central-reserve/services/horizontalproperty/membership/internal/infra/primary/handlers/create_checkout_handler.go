package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/membership/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateCheckout godoc
//
//	@Summary		Comprar una membresía
//	@Description	Mes (1 conjunto) o plan de administradora: valida el tope y que administres esos conjuntos; devuelve el enlace de Wompi
//	@Tags			Membresías
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		request.CheckoutRequest	true	"Plan, conjuntos y URL de retorno"
//	@Success		201		{object}	response.Success
//	@Router			/horizontal-properties/memberships/checkout [post]
func (h *handler) CreateCheckout(c *gin.Context) {
	userID, ok := currentUser(c)
	if !ok {
		return
	}
	var req request.CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	out, err := h.useCase.CreateCheckout(c.Request.Context(), dtos.CheckoutRequest{
		UserID: userID, IsSuperAdmin: middleware.IsSuperAdmin(c), PlanCode: req.PlanCode, BusinessIDs: req.BusinessIDs, RedirectURL: req.RedirectURL,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Pago iniciado", Data: response.Checkout{
		Membership: mappers.ToMembership(out.Membership), Reference: out.Payment.Reference, AmountInCents: out.Payment.AmountInCents, CheckoutURL: out.CheckoutURL,
	}})
}
