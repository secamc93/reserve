package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/membership/internal/infra/primary/handlers/response"

	"github.com/gin-gonic/gin"
)

// ListPlans godoc
//
//	@Summary	Planes de membresía
//	@Tags		Membresías
//	@Security	BearerAuth
//	@Produce	json
//	@Success	200	{object}	response.Success
//	@Router		/horizontal-properties/memberships/plans [get]
func (h *handler) ListPlans(c *gin.Context) {
	c.JSON(http.StatusOK, response.Success{Success: true, Message: "Planes obtenidos", Data: mappers.ToPlans(h.useCase.ListPlans())})
}
