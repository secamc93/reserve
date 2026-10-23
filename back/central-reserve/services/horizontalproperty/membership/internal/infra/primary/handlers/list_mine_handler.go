package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ListMine godoc
//
//	@Summary	Membresías compradas por el usuario
//	@Tags		Membresías
//	@Security	BearerAuth
//	@Produce	json
//	@Success	200	{object}	response.Success
//	@Router		/horizontal-properties/memberships/mine [get]
func (h *handler) ListMine(c *gin.Context) {
	userID, ok := currentUser(c)
	if !ok {
		return
	}
	ms, err := h.useCase.ListMine(c.Request.Context(), userID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Membresías obtenidas", Data: mappers.ToMemberships(ms)})
}
