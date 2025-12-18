package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// CreateCommonArea crea una nueva zona común
func (h *CommonAreaHandler) CreateCommonArea(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateCommonArea")

	var req request.CreateCommonAreaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	dto := domain.CreateCommonAreaDTO{
		BusinessID:           businessID,
		CommonAreaTypeID:     req.CommonAreaTypeID,
		Name:                 req.Name,
		Description:          req.Description,
		Location:             req.Location,
		MaxCapacity:          req.MaxCapacity,
		AreaSqm:              req.AreaSqm,
		HasEquipment:         req.HasEquipment,
		EquipmentDescription: req.EquipmentDescription,
		HourlyRate:           req.HourlyRate,
		RequiresApproval:     req.RequiresApproval,
		RequiresDeposit:      req.RequiresDeposit,
		DepositAmount:        req.DepositAmount,
		AllowsRecurring:      req.AllowsRecurring,
		ImageURLs:            req.ImageURLs,
	}

	area, err := h.useCase.CreateCommonArea(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando zona común")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando zona común",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Zona común creada exitosamente",
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
