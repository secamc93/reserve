package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) ListGroups(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListGroups")

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

	filters := domain.GroupFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
		Name:       c.Query("name"),
		Category:   c.Query("category"),
	}

	if coachIDStr := c.Query("coach_id"); coachIDStr != "" {
		if id, err := strconv.ParseUint(coachIDStr, 10, 32); err == nil {
			coachID := uint(id)
			filters.CoachID = &coachID
		}
	}

	if skillLevelIDStr := c.Query("skill_level_id"); skillLevelIDStr != "" {
		if id, err := strconv.ParseUint(skillLevelIDStr, 10, 32); err == nil {
			skillLevelID := uint(id)
			filters.SkillLevelID = &skillLevelID
		}
	}

	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		filters.IsActive = &isActive
	}

	result, err := h.useCase.ListGroups(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando grupos de entrenamiento")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando grupos de entrenamiento",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.GroupListData, len(result.Groups))
	for i, g := range result.Groups {
		data[i] = response.GroupListData{
			ID:              g.ID,
			Name:            g.Name,
			Code:            g.Code,
			Category:        g.Category,
			CoachName:       g.CoachName,
			MaxCapacity:     g.MaxCapacity,
			CurrentCapacity: g.CurrentCapacity,
			SkillLevelName:  g.SkillLevelName,
			IsActive:        g.IsActive,
			CreatedAt:       g.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedGroupsResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
