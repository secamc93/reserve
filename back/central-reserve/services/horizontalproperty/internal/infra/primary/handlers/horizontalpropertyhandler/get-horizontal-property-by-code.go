package horizontalpropertyhandler

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
)

// GetHorizontalPropertyByCode godoc
// @Summary Obtener propiedad horizontal por código
// @Description Obtiene una propiedad horizontal específica por su código único
// @Tags Propiedades Horizontales
// @Accept json
// @Produce json
// @Param code path string true "Código de la propiedad horizontal"
// @Success 200 {object} response.HorizontalPropertySuccessResponse
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/code/{code} [get]
func (h *HorizontalPropertyHandler) GetHorizontalPropertyByCode(c *gin.Context) {
	// Get code from path parameter
	code := c.Param("code")
	if code == "" {
		h.logger.Error().Msg("Código de propiedad horizontal vacío")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Código requerido",
			Error:   "El código de la propiedad horizontal es requerido",
		})
		return
	}

	// Call use case
	result, err := h.horizontalPropertyUseCase.GetHorizontalPropertyByCode(c.Request.Context(), code)
	if err != nil {
		h.logger.Error().Err(err).Str("code", code).Msg("Error getting horizontal property by code")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{
				Success: false,
				Message: "Error interno del servidor",
				Error:   err.Error(),
			})
		}
		return
	}

	// Map domain DTO to response
	responseData := mapper.MapDTOToResponse(result)

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertySuccessResponse{
		Success: true,
		Message: "Propiedad horizontal obtenida exitosamente",
		Data:    *responseData,
	})

	h.logger.Info().
		Uint("id", result.ID).
		Str("name", result.Name).
		Str("code", result.Code).
		Msg("Propiedad horizontal obtenida exitosamente por código")
}
