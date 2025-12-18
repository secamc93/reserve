package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetCommonAreaByID obtiene una zona común por ID
func (h *CommonAreaHandler) GetCommonAreaByID(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetCommonAreaByID")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   err.Error(),
		})
		return
	}

	area, err := h.useCase.GetCommonAreaByID(ctx, uint(id))
	if err != nil {
		if err == domain.ErrCommonAreaNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Zona común no encontrada",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error obteniendo zona común")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo zona común",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Data: response.CommonAreaResponse{
			ID:                   area.ID,
			BusinessID:           area.BusinessID,
			CommonAreaTypeID:     area.CommonAreaTypeID,
			Name:                 area.Name,
			Description:          area.Description,
			Location:             area.Location,
			MaxCapacity:          area.MaxCapacity,
			AreaSqm:              area.AreaSqm,
			HasEquipment:         area.HasEquipment,
			EquipmentDescription: area.EquipmentDescription,
			HourlyRate:           area.HourlyRate,
			RequiresApproval:     area.RequiresApproval,
			RequiresDeposit:      area.RequiresDeposit,
			DepositAmount:        area.DepositAmount,
			AllowsRecurring:      area.AllowsRecurring,
			IsActive:             area.IsActive,
			ImageURLs:            area.ImageURLs,
			CreatedAt:            area.CreatedAt,
			UpdatedAt:            area.UpdatedAt,
		},
	})
}
