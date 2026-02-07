package handlers

import (
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *SessionHandler) ListSessions(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListSessions")

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

	filters := domain.SessionFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
		Status:     c.Query("status"),
	}

	// Coach ID filter
	if coachIDStr := c.Query("coach_id"); coachIDStr != "" {
		if id, err := strconv.ParseUint(coachIDStr, 10, 32); err == nil {
			coachID := uint(id)
			filters.CoachID = &coachID
		}
	}

	// Training Group ID filter
	if groupIDStr := c.Query("training_group_id"); groupIDStr != "" {
		if id, err := strconv.ParseUint(groupIDStr, 10, 32); err == nil {
			groupID := uint(id)
			filters.TrainingGroupID = &groupID
		}
	}

	// Session Type ID filter
	if typeIDStr := c.Query("session_type_id"); typeIDStr != "" {
		if id, err := strconv.ParseUint(typeIDStr, 10, 32); err == nil {
			typeID := uint(id)
			filters.SessionTypeID = &typeID
		}
	}

	// Start Date filter
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filters.StartDate = &startDate
		}
	}

	// End Date filter
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filters.EndDate = &endDate
		}
	}

	result, err := h.useCase.ListSessions(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando sesiones")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando sesiones",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.SessionListData, len(result.Sessions))
	for i, s := range result.Sessions {
		data[i] = response.SessionListData{
			ID:                  s.ID,
			SessionTypeName:     s.SessionTypeName,
			SessionTypeCode:     s.SessionTypeCode,
			CoachName:           s.CoachName,
			GroupName:           s.GroupName,
			SessionMode:         s.SessionMode,
			ScheduledDate:       s.ScheduledDate,
			StartTime:           s.StartTime,
			EndTime:             s.EndTime,
			Duration:            s.Duration,
			Location:            s.Location,
			Field:               s.Field,
			MaxParticipants:     s.MaxParticipants,
			CurrentParticipants: s.CurrentParticipants,
			Price:               s.Price,
			Status:              s.Status,
			IsRecurring:         s.IsRecurring,
			CreatedAt:           s.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedSessionsResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
