package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/traininggroup/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateGroup")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	var req request.CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateGroupDTO{
		BusinessID:        businessID,
		CoachID:           req.CoachID,
		Name:              req.Name,
		Code:              req.Code,
		Category:          req.Category,
		Description:       req.Description,
		MaxCapacity:       req.MaxCapacity,
		AgeMin:            req.AgeMin,
		AgeMax:            req.AgeMax,
		SkillLevelID:      req.SkillLevelID,
		RecurringSchedule: req.RecurringSchedule,
		PhotoURL:          req.PhotoURL,
	}

	group, err := h.useCase.CreateGroup(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando grupo de entrenamiento")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando grupo de entrenamiento",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.GroupResponse{
		Success: true,
		Data:    mappers.GroupToResponse(group),
	})
}
