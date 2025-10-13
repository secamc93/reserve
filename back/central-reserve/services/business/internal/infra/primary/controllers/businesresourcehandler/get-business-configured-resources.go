package businesresourcehandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/mappers"

	"github.com/gin-gonic/gin"
)

// GetBusinessConfiguredResources obtiene business con recursos configurados con paginación
//
//	@Summary		Obtener business con recursos configurados
//	@Description	Obtiene todos los business con sus recursos configurados aplicando paginación
//	@Tags			Business Resources
//	@Accept			json
//	@Produce		json
//	@Param			page		query	int	false	"Número de página (por defecto: 1)"						default(1)
//	@Param			per_page	query	int	false	"Elementos por página (por defecto: 10, máximo: 100)"	default(10)
//	@Param			business_id	query	int	false	"ID del business para filtrar"
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}	"Business con recursos configurados obtenidos exitosamente"
//	@Failure		400	{object}	map[string]interface{}	"Parámetros inválidos"
//	@Failure		500	{object}	map[string]interface{}	"Error interno del servidor"
//	@Router			/business-resources/businesses/configured-resources [get]
func (h *businessResourceHandler) GetBusinessConfiguredResources(c *gin.Context) {
	// Obtener parámetros de paginación
	page := 1
	perPage := 10
	var businessID *uint

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if perPageStr := c.Query("per_page"); perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 && pp <= 100 {
			perPage = pp
		}
	}

	// Obtener filtro por business ID
	if businessIDStr := c.Query("business_id"); businessIDStr != "" {
		if bID, err := strconv.ParseUint(businessIDStr, 10, 32); err == nil {
			id := uint(bID)
			businessID = &id
		}
	}

	if businessID != nil {
		h.logger.Info().Int("page", page).Int("per_page", perPage).Uint("business_id", *businessID).Msg("Obteniendo business con recursos configurados (filtrado)")
	} else {
		h.logger.Info().Int("page", page).Int("per_page", perPage).Msg("Obteniendo business con recursos configurados")
	}

	// Llamar al caso de uso
	result, err := h.businessTypeResourceUseCase.GetBusinessesWithConfiguredResourcesPaginated(c.Request.Context(), page, perPage, businessID)
	if err != nil {
		h.logger.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("Error al obtener business con recursos configurados")
		c.JSON(http.StatusInternalServerError, mappers.ToErrorResponse(err, "Error interno del servidor"))
		return
	}

	// Mapear la respuesta exitosa
	responseData := mappers.ToBusinessesWithConfiguredResourcesPaginatedSuccessResponse(*result)

	h.logger.Info().Int("page", page).Int("per_page", perPage).Int64("total", result.Pagination.Total).Int("returned", len(result.Businesses)).Msg("Business con recursos configurados obtenidos exitosamente")

	c.JSON(http.StatusOK, responseData)
}
