package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *PlayerHandler) ListPlayers(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListPlayers")

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

	filters := domain.PlayerFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
		Name:       c.Query("name"),
	}

	if isMinorStr := c.Query("is_minor"); isMinorStr != "" {
		isMinor := isMinorStr == "true"
		filters.IsMinor = &isMinor
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

	result, err := h.useCase.ListPlayers(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando jugadores")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando jugadores",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.PlayerListData, len(result.Players))
	for i, p := range result.Players {
		data[i] = response.PlayerListData{
			ID:                p.ID,
			FirstName:         p.FirstName,
			LastName:          p.LastName,
			DocumentNumber:    p.DocumentNumber,
			DateOfBirth:       p.DateOfBirth,
			Gender:            p.Gender,
			Email:             p.Email,
			Phone:             p.Phone,
			PreferredPosition: p.PreferredPosition,
			SkillLevelName:    p.SkillLevelName,
			IsMinor:           p.IsMinor,
			IsActive:          p.IsActive,
			CreatedAt:         p.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedPlayersResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
