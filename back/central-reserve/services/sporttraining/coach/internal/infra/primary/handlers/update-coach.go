package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) UpdateCoach(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateCoach")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.UpdateCoachRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	isAvailable := true
	if req.IsAvailable != nil {
		isAvailable = *req.IsAvailable
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	dto := domain.UpdateCoachDTO{
		ID:                 uint(id),
		BusinessID:         businessID,
		FirstName:          req.FirstName,
		LastName:           req.LastName,
		DocumentType:       req.DocumentType,
		DocumentNumber:     req.DocumentNumber,
		Email:              req.Email,
		Phone:              req.Phone,
		LicenseNumber:      req.LicenseNumber,
		YearsOfExperience:  req.YearsOfExperience,
		Biography:          req.Biography,
		Certifications:     req.Certifications,
		IsAvailable:        isAvailable,
		MaxSessionsPerDay:  req.MaxSessionsPerDay,
		MaxSessionsPerWeek: req.MaxSessionsPerWeek,
		HourlyRate:         req.HourlyRate,
		PhotoURL:           req.PhotoURL,
		Notes:              req.Notes,
		IsActive:           isActive,
	}

	coach, err := h.useCase.UpdateCoach(ctx, dto)
	if err != nil {
		if err == domain.ErrCoachNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Entrenador no encontrado",
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error actualizando entrenador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando entrenador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.CoachResponse{
		Success: true,
		Data:    mappers.CoachToResponse(coach),
	})
}
