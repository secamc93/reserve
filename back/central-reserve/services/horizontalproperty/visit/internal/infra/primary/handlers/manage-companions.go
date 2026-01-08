package handlers

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

// GetCompanions obtiene los acompañantes de una visita
// @Summary Listar acompañantes
// @Description Obtiene todos los acompañantes de una visita
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Success 200 {object} response.CompanionsResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id}/companions [get]
func (h *VisitHandler) GetCompanions(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "GetCompanions")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	companions, err := h.useCase.GetCompanionsByVisitID(ctx, uint(visitID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error obteniendo acompañantes",
			Error:   err.Error(),
		})
		return
	}

	data := make([]response.CompanionData, len(companions))
	for i, comp := range companions {
		data[i] = response.CompanionData{
			ID:             comp.ID,
			VisitID:        comp.VisitID,
			CompanionName:  comp.CompanionName,
			CompanionDNI:   comp.CompanionDNI,
			CompanionPhone: comp.CompanionPhone,
			IsMinor:        comp.IsMinor,
			Relationship:   comp.Relationship,
			Notes:          comp.Notes,
		}
	}

	c.JSON(http.StatusOK, response.CompanionsResponse{
		Success: true,
		Data:    data,
	})
}

// CreateCompanion crea un acompañante para una visita
// @Summary Crear acompañante
// @Description Agrega un acompañante a una visita
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Param body body request.CreateCompanionRequest true "Datos del acompañante"
// @Success 201 {object} response.CompanionResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id}/companions [post]
func (h *VisitHandler) CreateCompanion(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "CreateCompanion")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	var req request.CreateCompanionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de acompañante inválidos",
			Error:   err.Error(),
		})
		return
	}

	dto := domain.CreateVisitCompanionDTO{
		CompanionName:  req.CompanionName,
		CompanionDNI:   req.CompanionDNI,
		CompanionPhone: req.CompanionPhone,
		IsMinor:        req.IsMinor,
		Relationship:   req.Relationship,
		Notes:          req.Notes,
	}

	companion, err := h.useCase.CreateCompanion(ctx, uint(visitID), dto)
	if err != nil {
		if err == domain.ErrVisitNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Visita no encontrada",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error creando acompañante",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response.CompanionResponse{
		Success: true,
		Data: response.CompanionData{
			ID:             companion.ID,
			VisitID:        companion.VisitID,
			CompanionName:  companion.CompanionName,
			CompanionDNI:   companion.CompanionDNI,
			CompanionPhone: companion.CompanionPhone,
			IsMinor:        companion.IsMinor,
			Relationship:   companion.Relationship,
			Notes:          companion.Notes,
		},
	})
}

// DeleteCompanion elimina un acompañante
// @Summary Eliminar acompañante
// @Description Elimina un acompañante de una visita
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Param companion_id path int true "ID del acompañante"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id}/companions/{companion_id} [delete]
func (h *VisitHandler) DeleteCompanion(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "DeleteCompanion")

	companionIDParam := c.Param("companion_id")
	companionID, err := strconv.ParseUint(companionIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de acompañante inválido",
		})
		return
	}

	err = h.useCase.DeleteCompanion(ctx, uint(companionID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error eliminando acompañante",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse{
		Success: true,
		Message: "Acompañante eliminado correctamente",
	})
}
