package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
)

// GetHorizontalPropertyByID godoc
// @Summary Obtener propiedad horizontal por ID
// @Description Obtiene una propiedad horizontal específica por su ID
// @Tags Propiedades Horizontales
// @Accept json
// @Produce json
// @Param id path int true "ID de la propiedad horizontal"
// @Success 200 {object} response.HorizontalPropertySuccessResponse
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{id} [get]
func (h *HorizontalPropertyHandler) GetHorizontalPropertyByID(c *gin.Context) {
	// Get ID from path parameter
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("id_param", idParam).Msg("Error parsing ID parameter")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID inválido",
			Error:   "El ID debe ser un número válido",
		})
		return
	}

	// Call use case
	result, err := h.horizontalPropertyUseCase.GetHorizontalPropertyByID(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error getting horizontal property by ID")

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
		Msg("Propiedad horizontal obtenida exitosamente")
}
