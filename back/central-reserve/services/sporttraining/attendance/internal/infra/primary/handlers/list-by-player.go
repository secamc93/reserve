package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *AttendanceHandler) ListByPlayer(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListByPlayer")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	playerIDStr := c.Param("player_id")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "player_id inválido",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	playerIDUint := uint(playerID)
	filters := domain.AttendanceFiltersDTO{
		BusinessID: businessID,
		PlayerID:   &playerIDUint,
		Page:       page,
		PageSize:   pageSize,
	}

	result, err := h.useCase.ListByPlayer(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando asistencia por jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando asistencia",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.AttendanceListData, len(result.Records))
	for i, r := range result.Records {
		data[i] = response.AttendanceListData{
			ID:                  r.ID,
			TrainingSessionID:   r.TrainingSessionID,
			SessionDate:         r.SessionDate,
			SessionLocation:     r.SessionLocation,
			PlayerID:            r.PlayerID,
			PlayerName:          r.PlayerName,
			AttendanceStatusID:  r.AttendanceStatusID,
			StatusName:          r.StatusName,
			StatusCode:          r.StatusCode,
			StatusColor:         r.StatusColor,
			CheckInTime:         r.CheckInTime,
			CheckOutTime:        r.CheckOutTime,
			PerformanceRating:   r.PerformanceRating,
			RecordedByCoachID:   r.RecordedByCoachID,
			RecordedByCoachName: r.RecordedByCoachName,
			RecordedAt:          r.RecordedAt,
			CreatedAt:           r.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedAttendanceResponse{
		Success:    true,
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
