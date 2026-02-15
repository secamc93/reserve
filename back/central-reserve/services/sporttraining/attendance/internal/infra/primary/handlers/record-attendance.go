package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/attendance/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *AttendanceHandler) RecordAttendance(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "RecordAttendance")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "user_id no disponible",
		})
		return
	}

	sessionIDStr := c.Param("id")
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "session_id inválido",
		})
		return
	}

	var req request.RecordAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateAttendanceDTO{
		TrainingSessionID:  uint(sessionID),
		PlayerID:           req.PlayerID,
		AttendanceStatusID: req.AttendanceStatusID,
		RecordedByCoachID:  userID,
		BusinessID:         businessID,
		CheckInTime:        req.CheckInTime,
		PerformanceRating:  req.PerformanceRating,
		CoachFeedback:      req.CoachFeedback,
		PlayerNotes:        req.PlayerNotes,
	}

	record, err := h.useCase.RecordAttendance(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error registrando asistencia")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error registrando asistencia",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.AttendanceResponse{
		Success: true,
		Data:    mappers.AttendanceToResponse(record),
	})
}
