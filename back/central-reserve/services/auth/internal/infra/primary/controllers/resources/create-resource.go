package resources

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/resources/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/resources/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateResourceHandler crea un nuevo recurso
// @Summary Crear recurso
// @Description Crea un nuevo recurso en el sistema con nombre y descripción únicos
// @Tags Resources
// @Accept json
// @Produce json
// @Param request body request.CreateResourceRequest true "Datos del recurso a crear"
// @Success 201 {object} map[string]interface{} "Recurso creado exitosamente"
// @Failure 400 {object} map[string]interface{} "Datos de entrada inválidos"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 409 {object} map[string]interface{} "Recurso ya existe"
// @Failure 500 {object} map[string]interface{} "Error interno del servidor"
// @Router /resources [post]
// @Security BearerAuth
func (h *ResourceHandler) CreateResourceHandler(c *gin.Context) {
	h.logger.Info().Msg("Iniciando creación de recurso")

	// Parsear el cuerpo de la petición
	var req request.CreateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error al parsear el cuerpo de la petición")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de entrada inválidos",
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info().Str("name", req.Name).Msg("Datos de creación de recurso recibidos")

	// Convertir a DTO de dominio
	createDTO := domain.CreateResourceDTO{
		Name:        req.Name,
		Description: req.Description,
	}

	// Llamar al caso de uso
	result, err := h.usecase.CreateResource(c.Request.Context(), createDTO)
	if err != nil {
		h.logger.Error().Err(err).Str("name", req.Name).Msg("Error al crear recurso")

		// Determinar el tipo de error y el código de estado HTTP
		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "ya existe un recurso con el nombre '"+req.Name+"'" {
			statusCode = http.StatusConflict
			errorMessage = "Recurso ya existe"
		} else if err.Error() == "el nombre del recurso es obligatorio" ||
			err.Error() == "el nombre del recurso no puede exceder 100 caracteres" ||
			err.Error() == "la descripción del recurso no puede exceder 500 caracteres" {
			statusCode = http.StatusBadRequest
			errorMessage = "Datos de entrada inválidos"
		}

		c.JSON(statusCode, response.ErrorResponse{
			Success: false,
			Message: errorMessage,
			Error:   err.Error(),
		})
		return
	}

	// Convertir a respuesta HTTP
	resourceResponse := response.ResourceResponse{
		ID:          result.ID,
		Name:        result.Name,
		Description: result.Description,
		CreatedAt:   result.CreatedAt,
		UpdatedAt:   result.UpdatedAt,
	}

	h.logger.Info().
		Uint("resource_id", result.ID).
		Str("name", result.Name).
		Msg("Recurso creado exitosamente")

	c.JSON(http.StatusCreated, response.CreateResourceResponse{
		Success: true,
		Message: "Recurso creado exitosamente",
		Data:    resourceResponse,
	})
}
