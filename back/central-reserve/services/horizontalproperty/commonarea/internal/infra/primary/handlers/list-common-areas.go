package handlers

import (
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/mappers"
	"net/http"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"

	"github.com/gin-gonic/gin"
)

// ListCommonAreas lista zonas comunes
func (h *CommonAreaHandler) ListCommonAreas(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListCommonAreas")

	var req request.ListCommonAreasRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros inválidos",
			Error:   err.Error(),
		})
		return
	}

	page, pageSize, err := pagination.Resolve(req.Page, req.PageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros de paginación inválidos",
			Error:   err.Error(),
		})
		return
	}
	req.Page, req.PageSize = page, pageSize

	businessID, ok := h.resolveBusinessID(c)
	if !ok {
		return
	}

	filters := domain.CommonAreaFiltersDTO{
		BusinessID:       businessID,
		CommonAreaTypeID: req.CommonAreaTypeID,
		IsActive:         req.IsActive,
		Search:           req.Search,
		Page:             req.Page,
		PageSize:         req.PageSize,
	}

	result, err := h.useCase.ListCommonAreas(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando zonas comunes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando zonas comunes",
			Error:   err.Error(),
		})
		return
	}

	commonAreas := make([]response.CommonAreaListResponse, len(result.CommonAreas))
	for i, area := range result.CommonAreas {
		commonAreas[i] = mappers.CommonAreaListToResponse(area)
	}

	c.JSON(http.StatusOK, response.PaginatedCommonAreasResponse{
		Success:    true,
		Data:       commonAreas,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
