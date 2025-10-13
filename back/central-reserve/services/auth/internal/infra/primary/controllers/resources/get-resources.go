package resources

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/resources/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/resources/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetResourcesHandler obtiene todos los recursos con filtros y paginación
//
//	@Summary		Obtener recursos
//	@Description	Obtiene una lista paginada de recursos del sistema con opciones de filtrado y ordenamiento
//	@Tags			Resources
//	@Accept			json
//	@Produce		json
//	@Param			page		query		int						false	"Número de página"	default(1)	minimum(1)
//	@Param			page_size	query		int						false	"Tamaño de página"	default(10)	minimum(1)	maximum(100)
//	@Param			name		query		string					false	"Filtrar por nombre (búsqueda parcial)"
//	@Param			description	query		string					false	"Filtrar por descripción (búsqueda parcial)"
//	@Param			sort_by		query		string					false	"Campo para ordenar"	Enums(name, created_at, updated_at)
//	@Param			sort_order	query		string					false	"Orden"					Enums(asc, desc)
//	@Success		200			{object}	map[string]interface{}	"Lista de recursos obtenida exitosamente"
//	@Failure		400			{object}	map[string]interface{}	"Parámetros de consulta inválidos"
//	@Failure		401			{object}	map[string]interface{}	"No autorizado"
//	@Failure		500			{object}	map[string]interface{}	"Error interno del servidor"
//	@Router			/resources [get]
//	@Security		BearerAuth
func (h *ResourceHandler) GetResourcesHandler(c *gin.Context) {
	h.logger.Info().Msg("Iniciando obtención de recursos")

	// Parsear parámetros de consulta
	var req request.GetResourcesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al parsear parámetros de consulta")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros de consulta inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Convertir a filtros de dominio
	filters := domain.ResourceFilters{
		Page:        req.Page,
		PageSize:    req.PageSize,
		Name:        req.Name,
		Description: req.Description,
		SortBy:      req.SortBy,
		SortOrder:   req.SortOrder,
	}

	// Llamar al caso de uso
	result, err := h.usecase.GetResources(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error al obtener recursos")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error interno del servidor",
			Error:   err.Error(),
		})
		return
	}

	// Convertir a respuesta HTTP
	var resourceResponses []response.ResourceResponse
	for _, resource := range result.Resources {
		resourceResponses = append(resourceResponses, response.ResourceResponse{
			ID:          resource.ID,
			Name:        resource.Name,
			Description: resource.Description,
			CreatedAt:   resource.CreatedAt,
			UpdatedAt:   resource.UpdatedAt,
		})
	}

	listResponse := response.ResourceListResponse{
		Resources:  resourceResponses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}

	h.logger.Info().
		Int64("total", result.Total).
		Int("returned", len(resourceResponses)).
		Int("page", result.Page).
		Msg("Recursos obtenidos exitosamente")

	c.JSON(http.StatusOK, response.GetResourcesResponse{
		Success: true,
		Message: "Recursos obtenidos exitosamente",
		Data:    listResponse,
	})
}
