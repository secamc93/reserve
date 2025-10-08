package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// UpdateHorizontalProperty godoc
// @Summary Actualizar propiedad horizontal
// @Description Actualiza una propiedad horizontal existente
// @Tags Propiedades Horizontales
// @Accept json
// @Produce json
// @Param hp_id path int true "ID de la propiedad horizontal"
// @Param horizontal_property body request.UpdateHorizontalPropertyRequest true "Datos a actualizar"
// @Success 200 {object} response.HorizontalPropertySuccessResponse
// @Failure 400 {object} object
// @Failure 404 {object} object
// @Failure 409 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties/{hp_id} [put]
func (h *HorizontalPropertyHandler) UpdateHorizontalProperty(c *gin.Context) {
	// Get ID from path parameter
	idParam := c.Param("hp_id")
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

	var req request.UpdateHorizontalPropertyRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error binding JSON request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Datos de entrada inválidos",
			Error:   err.Error(),
		})
		return
	}

	// Validate request
	validate := validator.New()
	if err := validate.Struct(&req); err != nil {
		h.logger.Error().Err(err).Msg("Error validating update request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Errores de validación",
			Error:   err.Error(),
		})
		return
	}

	// Map request to domain DTO
	dto := mapper.MapUpdateRequestToDTO(&req)

	// Call use case
	result, err := h.horizontalPropertyUseCase.UpdateHorizontalProperty(c.Request.Context(), uint(id), dto)
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error updating horizontal property")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
			})
		case "ya existe una propiedad horizontal con este código":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El código de la propiedad horizontal ya existe",
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
		Message: "Propiedad horizontal actualizada exitosamente",
		Data:    *responseData,
	})

	h.logger.Info().
		Uint("id", result.ID).
		Str("name", result.Name).
		Str("code", result.Code).
		Msg("Propiedad horizontal actualizada exitosamente")
}
