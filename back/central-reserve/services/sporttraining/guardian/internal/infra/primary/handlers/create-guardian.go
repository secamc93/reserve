package handlers

import (
	"net/http"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) CreateGuardian(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateGuardian")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	var req request.CreateGuardianRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateGuardianDTO{
		BusinessID:       businessID,
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		DocumentType:     req.DocumentType,
		DocumentNumber:   req.DocumentNumber,
		Email:            req.Email,
		Phone:            req.Phone,
		SecondaryPhone:   req.SecondaryPhone,
		Address:          req.Address,
		City:             req.City,
		State:            req.State,
		Country:          req.Country,
		Relationship:     req.Relationship,
		PhotoURL:         req.PhotoURL,
		Notes:            req.Notes,
		CanBookSessions:  req.CanBookSessions,
		CanAccessRecords: req.CanAccessRecords,
	}

	guardian, err := h.useCase.CreateGuardian(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error creando tutor")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando tutor",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.GuardianResponse{
		Success: true,
		Data:    mappers.GuardianToResponse(guardian),
	})
}
