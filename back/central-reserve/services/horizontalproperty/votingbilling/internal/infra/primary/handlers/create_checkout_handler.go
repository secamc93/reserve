package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// CreateCheckout godoc
//
//	@Summary		Iniciar el pago de los días de votación
//	@Description	Crea un pago pendiente por los días que debe el grupo y devuelve el enlace de Wompi
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int						true	"ID del grupo de votación"
//	@Param			business_id	query		int						false	"Obligatorio para super admin"
//	@Param			body		body		request.CheckoutRequest	true	"URL a la que vuelve el usuario después de pagar"
//	@Success		201			{object}	response.Success
//	@Failure		409			{object}	response.ErrorResponse
//	@Failure		503			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/payments/checkout [post]
func (h *handler) CreateCheckout(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	groupID, ok := groupIDParam(c)
	if !ok {
		return
	}
	var req request.CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	checkout, err := h.useCase.CreateCheckout(c.Request.Context(), dtos.CheckoutRequest{
		BusinessID:    businessID,
		VotingGroupID: groupID,
		UserID:        userID(c),
		RedirectURL:   req.RedirectURL,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Pago iniciado", Data: mappers.ToCheckout(checkout)})
}
