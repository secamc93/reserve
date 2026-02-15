package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/guardian/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *GuardianHandler) UpdateGuardian(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdateGuardian")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
		})
		return
	}

	var req request.UpdateGuardianRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	dto := domain.UpdateGuardianDTO{
		ID:               uint(id),
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
		IsActive:         isActive,
	}

	guardian, err := h.useCase.UpdateGuardian(ctx, dto)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error actualizando tutor")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando tutor",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.GuardianResponse{
		Success: true,
		Data:    mappers.GuardianToResponse(guardian),
	})
}
