package handlers

import (
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/session/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *SessionHandler) UpdateSession(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateSession")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Parse scheduled_date
	scheduledDate, err := time.Parse("2006-01-02", req.ScheduledDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Formato de fecha inválido, use YYYY-MM-DD",
		})
		return
	}

	// Parse start_time
	startTimeParsed, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Formato de hora de inicio inválido, use HH:MM",
		})
		return
	}

	// Parse end_time
	endTimeParsed, err := time.Parse("15:04", req.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Formato de hora de fin inválido, use HH:MM",
		})
		return
	}

	// Combine scheduled_date with start_time and end_time
	startTime := time.Date(
		scheduledDate.Year(),
		scheduledDate.Month(),
		scheduledDate.Day(),
		startTimeParsed.Hour(),
		startTimeParsed.Minute(),
		0, 0,
		scheduledDate.Location(),
	)

	endTime := time.Date(
		scheduledDate.Year(),
		scheduledDate.Month(),
		scheduledDate.Day(),
		endTimeParsed.Hour(),
		endTimeParsed.Minute(),
		0, 0,
		scheduledDate.Location(),
	)

	dto := domain.UpdateSessionDTO{
		ID:                    uint(id),
		BusinessID:            businessID,
		TrainingSessionTypeID: req.TrainingSessionTypeID,
		CoachID:               req.CoachID,
		TrainingGroupID:       req.TrainingGroupID,
		SessionMode:           req.SessionMode,
		ScheduledDate:         scheduledDate,
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              req.Duration,
		Location:              req.Location,
		Field:                 req.Field,
		MaxParticipants:       req.MaxParticipants,
		Price:                 req.Price,
		IsRecurring:           req.IsRecurring,
		CoachNotes:            req.CoachNotes,
		PublicNotes:           req.PublicNotes,
	}

	session, err := h.useCase.UpdateSession(ctx, dto)
	if err != nil {
		if err == domain.ErrSessionNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Sesión no encontrada",
			})
			return
		}

		h.logger.Error(ctx).Err(err).Msgf("Error actualizando sesión %d", id)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando sesión",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SessionResponse{
		Success: true,
		Data:    mappers.SessionToResponse(session),
	})
}
