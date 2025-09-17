package businesresourcehandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/business/internal/infra/primary/controllers/businesresourcehandler/mappers"

	"github.com/gin-gonic/gin"
)

// GetBusinessTypesWithResources obtiene todos los tipos de negocio con sus recursos asociados con paginación
// @Summary Obtener tipos de negocio con recursos
// @Description Obtiene todos los tipos de negocio con sus recursos asociados aplicando paginación
// @Tags Business Resources
// @Accept json
// @Produce json
// @Param page query int false "Número de página (por defecto: 1)" default(1)
// @Param per_page query int false "Elementos por página (por defecto: 10, máximo: 100)" default(10)
// @Param business_type_id query int false "ID del tipo de negocio para filtrar"
// @Security BearerAuth
// @Success      200          {object}  map[string]interface{} "Tipos de negocio con recursos obtenidos exitosamente"
// @Failure      400          {object}  map[string]interface{} "Solicitud inválida"
// @Failure      401          {object}  map[string]interface{} "Token de acceso requerido"
// @Failure      500          {object}  map[string]interface{} "Error interno del servidor"
// @Router /business-resources/resources [get]
func (h *businessResourceHandler) GetBusinessTypesWithResources(c *gin.Context) {
	// Obtener parámetros de paginación
	page := 1
	perPage := 10
	var businessTypeID *uint

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

	// Obtener filtro por business type ID
	if businessTypeIDStr := c.Query("business_type_id"); businessTypeIDStr != "" {
		if btID, err := strconv.ParseUint(businessTypeIDStr, 10, 32); err == nil {
			id := uint(btID)
			businessTypeID = &id
		}
	}

	if businessTypeID != nil {
		h.logger.Info().Int("page", page).Int("per_page", perPage).Uint("business_type_id", *businessTypeID).Msg("Obteniendo tipos de negocio con recursos (filtrado)")
	} else {
		h.logger.Info().Int("page", page).Int("per_page", perPage).Msg("Obteniendo tipos de negocio con recursos")
	}

	// Llamar al caso de uso
	result, err := h.businessTypeResourceUseCase.GetBusinessTypesWithResourcesPaginated(c.Request.Context(), page, perPage, businessTypeID)
	if err != nil {
		h.logger.Error().Err(err).Int("page", page).Int("per_page", perPage).Msg("Error al obtener tipos de negocio con recursos")
		c.JSON(http.StatusInternalServerError, mappers.ToErrorResponse(err, "Error interno del servidor"))
		return
	}

	// Mapear la respuesta exitosa
	responseData := mappers.ToBusinessTypesWithResourcesPaginatedSuccessResponse(*result)

	h.logger.Info().Int("page", page).Int("per_page", perPage).Int64("total", result.Pagination.Total).Int("returned", len(result.BusinessTypes)).Msg("Tipos de negocio con recursos obtenidos exitosamente")

	c.JSON(http.StatusOK, responseData)
}
