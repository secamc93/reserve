package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// RegisterManualPayment godoc
//
//	@Summary		Registrar un pago manual (super admin)
//	@Description	Marca como pagados los días pendientes del grupo con un pago recibido por fuera de la pasarela
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			group_id	path		int								true	"ID del grupo de votación"
//	@Param			business_id	query		int								true	"Propiedad del grupo"
//	@Param			body		body		request.ManualPaymentRequest	false	"Notas (p. ej. referencia de la transferencia)"
//	@Success		201			{object}	response.Success
//	@Failure		403			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-groups/{group_id}/payments/manual [post]
func (h *handler) RegisterManualPayment(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	groupID, ok := groupIDParam(c)
	if !ok {
		return
	}
	var req request.ManualPaymentRequest
	if c.Request.ContentLength > 0 {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
			return
		}
	}
	payment, err := h.useCase.RegisterManualPayment(c.Request.Context(), dtos.ManualPaymentRequest{
		BusinessID:    businessID,
		VotingGroupID: groupID,
		UserID:        userID(c),
		Notes:         req.Notes,
	})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, response.Success{Success: true, Message: "Pago manual registrado", Data: mappers.ToPayment(*payment)})
}
