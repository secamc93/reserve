package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) CreateCoach(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateCoach")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	var req request.CreateCoachRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateCoachDTO{
		BusinessID:         businessID,
		UserID:             req.UserID,
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
		MaxSessionsPerDay:  req.MaxSessionsPerDay,
		MaxSessionsPerWeek: req.MaxSessionsPerWeek,
		HourlyRate:         req.HourlyRate,
		PhotoURL:           req.PhotoURL,
		Notes:              req.Notes,
	}

	coach, err := h.useCase.CreateCoach(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando entrenador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando entrenador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.CoachResponse{
		Success: true,
		Data:    mappers.CoachToResponse(coach),
	})
}
