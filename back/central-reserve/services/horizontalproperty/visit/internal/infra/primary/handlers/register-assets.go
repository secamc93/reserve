package handlers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/request"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterAssets registra activos para una visita
// @Summary Registrar activos de visita
// @Description Registra equipos/herramientas que entran con el visitante
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Param request body request.RegisterAssetsRequest true "Lista de activos"
// @Success 200 {object} response.ErrorResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/{visit_id}/assets [post]
func (h *VisitHandler) RegisterAssets(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "RegisterAssets")

	visitIDParam := c.Param("visit_id")
	visitID, err := strconv.ParseUint(visitIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de visita inválido",
		})
		return
	}

	var req request.RegisterAssetsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos inválidos",
			Error:   err.Error(),
		})
		return
	}

	assets := make([]domain.CreateVisitAssetDTO, len(req.Assets))
	for i, a := range req.Assets {
		assets[i] = domain.CreateVisitAssetDTO{
			AssetName:        a.AssetName,
			AssetDescription: a.AssetDescription,
			AssetSerial:      a.AssetSerial,
			AssetBrand:       a.AssetBrand,
		}
	}

	if err := h.useCase.RegisterAssets(ctx, uint(visitID), assets); err != nil {
		h.logger.Error(ctx).Err(err).Uint("visit_id", uint(visitID)).Msg("Error registrando activos")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error registrando activos",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response.ErrorResponse{
		Success: true,
		Message: "Activos registrados exitosamente",
	})
}
