package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/visit/internal/app"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"

	"github.com/gin-gonic/gin"
)

type createVisitorVehicleRequest struct {
	VisitorID *uint  `json:"visitor_id"`
	Plate     string `json:"plate" binding:"required"`
	Brand     string `json:"brand"`
	Color     string `json:"color"`
}

// CreateVisitorVehicle registra (o reutiliza por placa) el vehículo de un visitante
// @Summary Registrar vehículo de visitante
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param business_id query int false "Solo super admin: negocio"
// @Success 200 {object} response.VisitorVehicleResponse
// @Failure 400 {object} response.ErrorResponse
// @Router /horizontal-properties/visits/vehicles [post]
func (h *VisitHandler) CreateVisitorVehicle(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "CreateVisitorVehicle")

	businessID, exists, bizErr := resolveBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: "business_id no disponible"})
		return
	}
	if bizErr != nil || businessID == 0 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "business_id requerido"})
		return
	}

	var req createVisitorVehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "Datos inválidos", Error: err.Error()})
		return
	}

	v, err := h.useCase.CreateOrGetVisitorVehicle(ctx, domain.VisitorVehicle{
		BusinessID: businessID,
		VisitorID:  req.VisitorID,
		Plate:      req.Plate,
		Brand:      req.Brand,
		Color:      req.Color,
	})
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, app.ErrVehicleInvalid) {
			status = http.StatusBadRequest
		}
		c.JSON(status, response.ErrorResponse{Success: false, Message: "No se pudo registrar el vehículo", Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.VisitorVehicleResponse{
		Success: true,
		Data:    response.VisitorVehicleData{ID: v.ID, VisitorID: v.VisitorID, Plate: v.Plate, Brand: v.Brand, Color: v.Color},
	})
}

// ListAssets lista los activos declarados de una visita
// @Summary Activos de una visita
// @Tags Visits
// @Produce json
// @Security BearerAuth
// @Param visit_id path int true "ID de la visita"
// @Success 200 {object} response.VisitAssetsResponse
// @Router /horizontal-properties/visits/{visit_id}/assets [get]
func (h *VisitHandler) ListAssets(c *gin.Context) {
	ctx := log.WithFunctionCtx(c.Request.Context(), "ListAssets")
	visitID, err := strconv.ParseUint(c.Param("visit_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: "ID de visita inválido"})
		return
	}
	assets, err := h.useCase.GetAssetsByVisitID(ctx, uint(visitID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Success: false, Message: "Error obteniendo activos", Error: err.Error()})
		return
	}
	data := make([]response.VisitAssetData, len(assets))
	for i, a := range assets {
		data[i] = response.VisitAssetData{
			ID: a.ID, AssetName: a.AssetName, AssetDescription: a.AssetDescription, AssetSerial: a.AssetSerial,
			AssetBrand: a.AssetBrand, EntryRegistered: a.EntryRegistered, ExitRegistered: a.ExitRegistered, ExitRegisteredAt: a.ExitRegisteredAt,
		}
	}
	c.JSON(http.StatusOK, response.VisitAssetsResponse{Success: true, Data: data})
}
