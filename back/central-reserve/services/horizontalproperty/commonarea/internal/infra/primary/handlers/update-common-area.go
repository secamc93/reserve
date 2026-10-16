package handlers

import (
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// UpdateCommonArea edita una zona común de la propiedad del usuario
func (h *CommonAreaHandler) UpdateCommonArea(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateCommonArea")

	id, ok := parseIDParam(c, "id")
	if !ok {
		return
	}
	var req request.UpdateCommonAreaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}
	current, ok := h.loadAreaInScope(c, id)
	if !ok {
		return
	}

	isActive := current.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	area, err := h.useCase.UpdateCommonArea(ctx, domain.UpdateCommonAreaDTO{
		ID:                   id,
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
		IsActive:             isActive,
		ImageURLs:            req.ImageURLs,
	})
	if err != nil {
		h.writeUseCaseError(c, err, "Error actualizando zona común")
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Zona común actualizada",
		Data:    mappers.CommonAreaToResponse(area),
	})
}
