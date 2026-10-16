package handlers

import (
	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/mappers"
	"central_reserve/services/horizontalproperty/visit/internal/infra/primary/handlers/response"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
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
// @Param page_size query int false "Tamaño de página (1-200)" default(10) minimum(1) maximum(200)
// @Param visitor_id query int false "ID del visitante"
// @Param property_unit_id query int false "ID de la unidad"
// @Param start_date query string false "Fecha inicio (YYYY-MM-DD)"
// @Param end_date query string false "Fecha fin (YYYY-MM-DD, inclusiva)"
// @Param visit_type_id query int false "ID del tipo de visita"
// @Param visit_status_id query int false "ID del estado"
// @Param state query string false "Estado de portería: inside, expected, left, cancelled"
// @Param q query string false "Busca por visitante (nombre o documento) o unidad"
// @Param business_id query int false "Solo super admin: negocio a consultar"
// @Success 200 {object} response.PaginatedVisitsResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /horizontal-properties/visits [get]
func (h *VisitHandler) ListVisits(c *gin.Context) {
	ctx := c.Request.Context()
	ctx = log.WithFunctionCtx(ctx, "ListVisits")

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

	filters := domain.VisitFiltersDTO{
		BusinessID: businessID,
		State:      c.Query("state"),
		Search:     c.Query("q"),
		Page:       page,
		PageSize:   pageSize,
	}

	if typeIDStr := c.Query("visit_type_id"); typeIDStr != "" {
		if typeID, err := strconv.ParseUint(typeIDStr, 10, 32); err == nil {
			id := uint(typeID)
			filters.VisitTypeID = &id
		}
	}

	if statusIDStr := c.Query("visit_status_id"); statusIDStr != "" {
		if statusID, err := strconv.ParseUint(statusIDStr, 10, 32); err == nil {
			id := uint(statusID)
			filters.VisitStatusID = &id
		}
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
			// Fecha fin inclusiva: hasta el último instante de ese día
			endOfDay := endDate.Add(24*time.Hour - time.Nanosecond)
			filters.EndDate = &endOfDay
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
