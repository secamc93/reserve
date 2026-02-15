package handlers

import (
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/services/sporttraining/booking/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *BookingHandler) ListBookings(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListBookings")

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

	filters := domain.BookingFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
		Status:     c.Query("status"),
	}

	if playerIDStr := c.Query("player_id"); playerIDStr != "" {
		if id, err := strconv.ParseUint(playerIDStr, 10, 32); err == nil {
			playerID := uint(id)
			filters.PlayerID = &playerID
		}
	}

	if coachIDStr := c.Query("coach_id"); coachIDStr != "" {
		if id, err := strconv.ParseUint(coachIDStr, 10, 32); err == nil {
			coachID := uint(id)
			filters.CoachID = &coachID
		}
	}

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if t, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filters.StartDate = &t
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if t, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filters.EndDate = &t
		}
	}

	result, err := h.useCase.ListBookings(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando reservas",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.BookingListData, len(result.Bookings))
	for i, b := range result.Bookings {
		data[i] = response.BookingListData{
			ID:                b.ID,
			TrainingSessionID: b.TrainingSessionID,
			PlayerID:          b.PlayerID,
			PlayerName:        b.PlayerName,
			SessionDate:       b.SessionDate,
			SessionMode:       b.SessionMode,
			Location:          b.Location,
			StatusName:        b.StatusName,
			StatusCode:        b.StatusCode,
			StatusColor:       b.StatusColor,
			BookingDate:       b.BookingDate,
			IsPaid:            b.IsPaid,
			Price:             b.Price,
			CreatedAt:         b.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedBookingsResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
