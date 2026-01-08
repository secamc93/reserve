package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// ListVisitTypes obtiene todos los tipos de visita
// @Summary Listar tipos de visita
// @Description Obtiene todos los tipos de visita activos
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.VisitTypesResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/types [get]
func (h *VisitHandler) ListVisitTypes(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListVisitTypes")

	// Obtener businessID del token
	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	types, err := h.useCase.GetVisitTypes(ctx, businessID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo tipos de visita",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.VisitTypeData, len(types))
	for i, t := range types {
		data[i] = response.VisitTypeData{
			ID:                          t.ID,
			Name:                        t.Name,
			Code:                        t.Code,
			Description:                 t.Description,
			RequiresAuthorization:       t.RequiresAuthorization,
			RequiresVehicleRegistration: t.RequiresVehicleRegistration,
			RequiresCompanions:          t.RequiresCompanions,
			RequiresAssetsTracking:      t.RequiresAssetsTracking,
			MaxDurationHours:            t.MaxDurationHours,
			DefaultDurationMinutes:      t.DefaultDurationMinutes,
			IsActive:                    t.IsActive,
		}
	}

	c.JSON(http.StatusOK, response.VisitTypesResponse{
		Success: true,
		Data:    data,
	})
}
