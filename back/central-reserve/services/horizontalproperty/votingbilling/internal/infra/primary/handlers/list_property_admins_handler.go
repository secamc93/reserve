package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/votingbilling/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ListPropertyAdmins godoc
//
//	@Summary		Administradores de la propiedad y su exención (super admin)
//	@Tags			Cobro de votaciones
//	@Security		BearerAuth
//	@Produce		json
//	@Param			business_id	query		int	true	"Propiedad"
//	@Success		200			{object}	response.Success
//	@Router			/horizontal-properties/voting-billing/admins [get]
func (h *handler) ListPropertyAdmins(c *gin.Context) {
	if !requireSuperAdmin(c) {
		return
	}
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	admins, err := h.useCase.ListPropertyAdmins(c.Request.Context(), businessID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Administradores obtenidos", Data: mappers.ToPropertyAdmins(admins)})
}
