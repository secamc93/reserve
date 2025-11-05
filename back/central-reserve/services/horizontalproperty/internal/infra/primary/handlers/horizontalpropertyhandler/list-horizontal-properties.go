package horizontalpropertyhandler

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ListHorizontalProperties godoc
//
//	@Summary		Listar propiedades horizontales
//	@Description	Obtiene una lista paginada de propiedades horizontales con filtros opcionales (incluye URLs de imágenes)
//	@Tags			Propiedades Horizontales
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			business_id	query	int		false	"ID del business (opcional para super admin)"
//	@Param			name		query		string	false	"Filtro por nombre (búsqueda parcial)"
//	@Param			code		query		string	false	"Filtro por código (búsqueda parcial)"
//	@Param			is_active	query		bool	false	"Filtro por estado activo"
//	@Param			page		query		int		false	"Número de página (mínimo 1)"	default(1)
//	@Param			page_size	query		int		false	"Tamaño de página (1-100)"		default(10)
//	@Param			order_by	query		string	false	"Campo de ordenamiento"			Enums(name, code, created_at, updated_at)	default(created_at)
//	@Param			order_dir	query		string	false	"Dirección de ordenamiento"		Enums(asc, desc)							default(desc)
//	@Success		200			{object}	response.HorizontalPropertyListSuccessResponse
//	@Failure		400			{object}	object
//	@Failure		500			{object}	object
//	@Router			/horizontal-properties [get]
func (h *HorizontalPropertyHandler) ListHorizontalProperties(c *gin.Context) {
	var req request.ListHorizontalPropertiesRequest

	// Bind query parameters
	if err := c.ShouldBindQuery(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error binding query parameters")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Parámetros de consulta inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Set default values if not provided
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}
	if req.OrderBy == "" {
		req.OrderBy = "created_at"
	}
	if req.OrderDir == "" {
		req.OrderDir = "desc"
	}

	// Validate request
	validate := validator.New()
	if err := validate.Struct(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validating list request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Errores de validación",
			Error:   err.Error(),
		})
		return
	}

	// Map request to domain DTO
	filters := mapper.MapListRequestToDTO(&req)

	// Call use case
	result, err := h.horizontalPropertyUseCase.ListHorizontalProperties(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error().Err(err).Interface("filters", filters).Msg("Error listing horizontal properties")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{
			Success: false,
			Message: "Error interno del servidor",
			Error:   err.Error(),
		})
		return
	}

	// Map domain DTO to response
	responseData := mapper.MapPaginatedDTOToResponse(result)

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertyListSuccessResponse{
		Success: true,
		Message: "Lista de propiedades horizontales obtenida exitosamente",
		Data:    *responseData,
	})

	h.logger.Info().
		Int("count", len(result.Data)).
		Int64("total", result.Total).
		Int("page", result.Page).
		Int("page_size", result.PageSize).
		Msg("Lista de propiedades horizontales obtenida exitosamente")
}
