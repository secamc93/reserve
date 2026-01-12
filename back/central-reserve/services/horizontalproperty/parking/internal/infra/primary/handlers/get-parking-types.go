package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/parking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetParkingTypes obtiene todos los tipos de parqueadero activos
func (h *ParkingHandler) GetParkingTypes(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetParkingTypes")

	types, err := h.useCase.GetParkingTypes(ctx)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de parqueadero")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo tipos de parqueadero",
			Error:   err.Error(),
		})
		return
	}

	typesResponse := make([]response.ParkingTypeResponse, len(types))
	for i, t := range types {
		typesResponse[i] = response.ParkingTypeResponse{
			ID:          t.ID,
			Name:        t.Name,
			Code:        t.Code,
			Description: t.Description,
			IsActive:    t.IsActive,
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   t.UpdatedAt,
		}
	}

	c.JSON(http.StatusOK, response.ParkingTypesResponse{
		Success: true,
		Data:    typesResponse,
	})
}
