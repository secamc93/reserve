package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SetExemption godoc
//
//	@Summary		Exentar una propiedad del cobro de votaciones (super admin)
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			business_id	query		int							true	"Propiedad"
//	@Param			body		body		request.ExemptionRequest	true	"true: no se le cobra"
//	@Success		200			{object}	response.Success
//	@Failure		403			{object}	response.ErrorResponse
//	@Router			/horizontal-properties/voting-billing/exemption [put]
func (h *handler) SetExemption(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	var req request.ExemptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	if err := h.useCase.SetExemption(c.Request.Context(), dtos.ExemptionRequest{BusinessID: businessID, Exempt: *req.Exempt, UserID: userID(c)}); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Exención actualizada", Data: gin.H{"business_id": businessID, "exempt": *req.Exempt}})
}
