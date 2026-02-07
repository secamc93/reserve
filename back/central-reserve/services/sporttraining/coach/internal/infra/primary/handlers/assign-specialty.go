package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/coach/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *CoachHandler) AssignSpecialty(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "AssignSpecialty")

	_, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	idParam := c.Param("id")
	coachID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de entrenador inválido",
		})
		return
	}

	var req request.AssignSpecialtyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.AssignSpecialtyDTO{
		CoachID:          uint(coachID),
		SpecialtyID:      req.SpecialtyID,
		ProficiencyLevel: req.ProficiencyLevel,
	}

	err = h.useCase.AssignSpecialty(ctx, dto)
	if err != nil {
		if err == domain.ErrInvalidProficiencyLevel {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		if err == domain.ErrSpecialtyAlreadyAssigned {
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error asignando especialidad")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error asignando especialidad",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse{
		Success: true,
		Message: "Especialidad asignada exitosamente",
	})
}
