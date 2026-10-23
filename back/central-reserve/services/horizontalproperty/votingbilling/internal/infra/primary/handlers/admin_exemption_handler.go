package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/domain/dtos"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// SetAdminExemption godoc
//
//	@Summary		Exentar a un administrador y todas sus propiedades (super admin)
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		request.AdminExemptionRequest	true	"Usuario, exención y notas"
//	@Success		200		{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/admin-exemption [put]
func (h *handler) SetAdminExemption(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	var req request.AdminExemptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	err := h.useCase.SetAdminExemption(c.Request.Context(), dtos.AdminExemptionRequest{TargetUserID: req.UserID, Exempt: *req.Exempt, Notes: req.Notes, ByUserID: userID(c)})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Exención del administrador actualizada", Data: gin.H{"user_id": req.UserID, "exempt": *req.Exempt}})
}
