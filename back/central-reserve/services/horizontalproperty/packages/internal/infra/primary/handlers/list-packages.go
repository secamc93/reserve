package handlers

import (
	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/services/horizontalproperty/packages/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ListPackages lista paquetes con filtros
// @Summary Listar paquetes
// @Description Lista paquetes con filtros y paginación
// @Tags Packages
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Página" default(1)
// @Param page_size query int false "Tamaño de página (1-200)" default(10) minimum(1) maximum(200)
// @Param property_unit_id query int false "ID de la unidad"
// @Param resident_id query int false "ID del residente"
// @Param package_status_id query int false "ID del estado"
// @Param start_date query string false "Fecha inicio (YYYY-MM-DD)"
// @Param end_date query string false "Fecha fin (YYYY-MM-DD)"
// @Param status_group query string false "Grupo de estados: pending, delivered, closed"
// @Param q query string false "Busca por guía, transportadora, unidad o residente"
// @Param business_id query int false "Solo super admin: negocio a consultar"
// @Success 200 {object} response.PaginatedPackagesResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/packages [get]
func (h *PackageHandler) ListPackages(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListPackages")

	businessID, exists, bizErr := resolveBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}
	if bizErr != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: bizErr.Error(),
		})
		return
	}

	page, pageSize, err := pagination.ParseQuery(c.Query("page"), c.Query("page_size"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros de paginación inválidos",
			Error:   err.Error(),
		})
		return
	}

	filters := domain.PackageFiltersDTO{
		BusinessID:  businessID,
		StatusGroup: c.Query("status_group"),
		Search:      c.Query("q"),
		Page:        page,
		PageSize:    pageSize,
	}

	if unitIDStr := c.Query("property_unit_id"); unitIDStr != "" {
		if unitID, err := strconv.ParseUint(unitIDStr, 10, 32); err == nil {
			id := uint(unitID)
			filters.PropertyUnitID = &id
		}
	}

	if residentIDStr := c.Query("resident_id"); residentIDStr != "" {
		if residentID, err := strconv.ParseUint(residentIDStr, 10, 32); err == nil {
			id := uint(residentID)
			filters.ResidentID = &id
		}
	}

	if statusIDStr := c.Query("package_status_id"); statusIDStr != "" {
		if statusID, err := strconv.ParseUint(statusIDStr, 10, 32); err == nil {
			id := uint(statusID)
			filters.PackageStatusID = &id
		}
	}

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filters.StartDate = &startDate
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filters.EndDate = &endDate
		}
	}

	result, err := h.useCase.ListPackages(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando paquetes")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando paquetes",
			Error:   err.Error(),
		})
		return
	}

	// Mapear resultado a respuesta
	packageData := make([]response.PackageListData, len(result.Packages))
	for i, p := range result.Packages {
		packageData[i] = response.PackageListData{
			ID:                 p.ID,
			TrackingNumber:     p.TrackingNumber,
			Carrier:            p.Carrier,
			PropertyUnitNumber: p.PropertyUnitNumber,
			PropertyUnitBlock:  p.PropertyUnitBlock,
			ResidentName:       p.ResidentName,
			StatusName:         p.StatusName,
			StatusCode:         p.StatusCode,
			Description:        p.Description,
			ReceivedAt:         p.ReceivedAt,
			DeliveredAt:        p.DeliveredAt,
			CreatedAt:          p.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response.PaginatedPackagesResponse{
		Success:    true,
		Data:       packageData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
