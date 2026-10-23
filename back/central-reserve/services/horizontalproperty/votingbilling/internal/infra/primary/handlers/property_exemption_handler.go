package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SetPropertyExemption godoc
//
//	@Summary		Exentar una propiedad del cobro (super admin)
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query		int							true	"Propiedad"
//	@Param			body		body		request.ExemptionRequest	true	"true: no se le cobra"
//	@Success		200			{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/exemption [put]
func (h *handler) SetPropertyExemption(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	var req request.ExemptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	if err := h.useCase.SetPropertyExemption(c.Request.Context(), dtos.PropertyExemptionRequest{BusinessID: businessID, Exempt: *req.Exempt, UserID: userID(c)}); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Exención actualizada", Data: gin.H{"business_id": businessID, "exempt": *req.Exempt}})
}
