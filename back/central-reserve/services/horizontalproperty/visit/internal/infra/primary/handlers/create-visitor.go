package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateVisitor crea o obtiene un visitante
// @Summary Crear o obtener visitante
// @Description Crea un nuevo visitante o lo obtiene si ya existe por DNI
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.CreateVisitorRequest true "Datos del visitante"
// @Success 200 {object} response.VisitorResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/visitors [post]
func (h *VisitHandler) CreateVisitor(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateVisitor")

	var req request.CreateVisitorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	var businessIDPtr *uint
	if businessID != 0 {
		businessIDPtr = &businessID
	}

	visitor, err := h.useCase.CreateOrGetVisitor(ctx, businessIDPtr, req.DNI, req.FullName, req.Phone)
	if err != nil {
		h.logger.Error(ctx).Err(err).Str("dni", req.DNI).Msg("Error creando/obteniendo visitante")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando visitante",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.VisitorResponse{
		Success: true,
		Data: response.VisitorData{
			ID:           visitor.ID,
			BusinessID:   visitor.BusinessID,
			DNI:          visitor.DNI,
			FullName:     visitor.FullName,
			Phone:        visitor.Phone,
			Email:        visitor.Email,
			PhotoURL:     visitor.PhotoURL,
			HasBlacklist: visitor.HasBlacklist,
			IsVerified:   visitor.IsVerified,
			TotalVisits:  visitor.TotalVisits,
		},
	})
}
