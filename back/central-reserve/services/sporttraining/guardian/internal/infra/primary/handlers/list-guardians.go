package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) ListGuardians(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListGuardians")

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
	name := c.Query("name")
	isActiveStr := c.Query("is_active")

	var isActive *bool
	if isActiveStr != "" {
		val, _ := strconv.ParseBool(isActiveStr)
		isActive = &val
	}

	filters := domain.GuardianFiltersDTO{
		BusinessID: businessID,
		Name:       name,
		IsActive:   isActive,
		Page:       page,
		PageSize:   pageSize,
	}

	result, err := h.useCase.ListGuardians(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando tutores")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando tutores",
			Error:   err.Error(),
		})
		return
	}

	guardianListData := make([]response.GuardianListData, len(result.Guardians))
	for i, g := range result.Guardians {
		guardianListData[i] = response.GuardianListData{
			ID:             g.ID,
			FirstName:      g.FirstName,
			LastName:       g.LastName,
			DocumentNumber: g.DocumentNumber,
			Email:          g.Email,
			Phone:          g.Phone,
			Relationship:   g.Relationship,
			IsActive:       g.IsActive,
			CreatedAt:      g.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedGuardiansResponse{
		Success:    true,
		Data:       guardianListData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
