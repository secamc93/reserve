package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) ListCoaches(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListCoaches")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	filters := domain.CoachFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
		Name:       c.Query("name"),
	}

	if isAvailableStr := c.Query("is_available"); isAvailableStr != "" {
		isAvailable := isAvailableStr == "true"
		filters.IsAvailable = &isAvailable
	}

	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		filters.IsActive = &isActive
	}

	result, err := h.useCase.ListCoaches(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando entrenadores")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando entrenadores",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.CoachListData, len(result.Coaches))
	for i, co := range result.Coaches {
		data[i] = response.CoachListData{
			ID:                co.ID,
			FirstName:         co.FirstName,
			LastName:          co.LastName,
			DocumentNumber:    co.DocumentNumber,
			Email:             co.Email,
			Phone:             co.Phone,
			YearsOfExperience: co.YearsOfExperience,
			IsAvailable:       co.IsAvailable,
			IsActive:          co.IsActive,
			CreatedAt:         co.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedCoachesResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
