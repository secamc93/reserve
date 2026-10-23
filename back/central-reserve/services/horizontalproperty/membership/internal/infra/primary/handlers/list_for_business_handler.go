package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ListForBusiness godoc
//
//	@Summary	Membresías que incluyen la propiedad
//	@Tags		Membresías
//	@Security	BearerAuth
//	@Produce	json
//	@Param		business_id	query		int	false	"Obligatorio para super admin"
//	@Success	200			{object}	response.Success
//	@Router		/horizontal-properties/memberships [get]
func (h *handler) ListForBusiness(c *gin.Context) {
	businessID, ok := businessScope(c)
	if !ok {
		return
	}
	ms, err := h.useCase.ListForBusiness(c.Request.Context(), businessID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Membresías obtenidas", Data: mappers.ToMemberships(ms)})
}
