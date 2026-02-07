package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"central_reserve/services/auth/middleware"
	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/mappers"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/request"
	"central_reserve/services/sporttraining/player/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

func (h *PlayerHandler) UpdatePlayer(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "UpdatePlayer")

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

	var req request.UpdatePlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Formato de fecha inválido, use YYYY-MM-DD",
		})
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	dto := domain.UpdatePlayerDTO{
		ID:                  uint(id),
		BusinessID:          businessID,
		FirstName:           req.FirstName,
		LastName:            req.LastName,
		DocumentType:        req.DocumentType,
		DocumentNumber:      req.DocumentNumber,
		DateOfBirth:         dob,
		Gender:              req.Gender,
		Email:               req.Email,
		Phone:               req.Phone,
		Address:             req.Address,
		City:                req.City,
		State:               req.State,
		Country:             req.Country,
		SkillLevelID:        req.SkillLevelID,
		PreferredPosition:   req.PreferredPosition,
		Height:              req.Height,
		Weight:              req.Weight,
		JerseyNumber:        req.JerseyNumber,
		BloodType:           req.BloodType,
		HasAllergies:        req.HasAllergies,
		AllergyDetails:      req.AllergyDetails,
		HasMedicalCondition: req.HasMedicalCondition,
		MedicalDetails:      req.MedicalDetails,
		EmergencyContact:    req.EmergencyContact,
		EmergencyPhone:      req.EmergencyPhone,
		PhotoURL:            req.PhotoURL,
		Notes:               req.Notes,
		IsActive:            isActive,
	}

	player, err := h.useCase.UpdatePlayer(ctx, dto)
	if err != nil {
		if errors.Is(err, domain.ErrPlayerNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		h.logger.Error(ctx).Err(err).Msg("Error actualizando jugador")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error actualizando jugador",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.PlayerResponse{
		Success: true,
		Data:    mappers.PlayerToResponse(player),
	})
}
