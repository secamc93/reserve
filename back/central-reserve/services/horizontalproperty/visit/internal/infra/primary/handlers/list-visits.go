package handlers

import (
	"central_reserve/services/auth/middleware"
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ListVisits lista visitas con filtros
// @Summary Listar visitas
// @Description Lista visitas con filtros y paginación
// @Tags Visits
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Página" default(1)
// @Param page_size query int false "Tamaño de página" default(10)
// @Param visitor_id query int false "ID del visitante"
// @Param property_unit_id query int false "ID de la unidad"
// @Param start_date query string false "Fecha inicio (YYYY-MM-DD)"
// @Param end_date query string false "Fecha fin (YYYY-MM-DD)"
// @Success 200 {object} response.PaginatedVisitsResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits [get]
func (h *VisitHandler) ListVisits(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListVisits")

	businessID, exists := middleware.GetBusinessID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{
			Success: false,
			Message: "business_id no disponible",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	filters := domain.VisitFiltersDTO{
		BusinessID: businessID,
		Page:       page,
		PageSize:   pageSize,
	}

	if visitorIDStr := c.Query("visitor_id"); visitorIDStr != "" {
		if visitorID, err := strconv.ParseUint(visitorIDStr, 10, 32); err == nil {
			id := uint(visitorID)
			filters.VisitorID = &id
		}
	}

	if unitIDStr := c.Query("property_unit_id"); unitIDStr != "" {
		if unitID, err := strconv.ParseUint(unitIDStr, 10, 32); err == nil {
			id := uint(unitID)
			filters.PropertyUnitID = &id
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

	result, err := h.useCase.ListVisits(ctx, filters)
	if err != nil {
		h.logger.Error(ctx).Err(err).Msg("Error listando visitas")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error listando visitas",
			Error:   err.Error(),
		})
		return
	}

	// Mapear resultado a respuesta usando mapper
	visitData := mappers.VisitListDTOsToResponse(result.Visits)

	c.JSON(http.StatusOK, response.PaginatedVisitsResponse{
		Success:    true,
		Data:       visitData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	})
}
