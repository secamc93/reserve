package horizontalpropertyhandler

import (
	"net/http"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/mapper"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/request"
	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// CreateHorizontalProperty godoc
// @Summary Crear una nueva propiedad horizontal
// @Description Crea una nueva propiedad horizontal con la información proporcionada
// @Tags Propiedades Horizontales
// @Accept json
// @Produce json
// @Param horizontal_property body request.CreateHorizontalPropertyRequest true "Datos de la propiedad horizontal"
// @Success 201 {object} response.HorizontalPropertySuccessResponse
// @Failure 400 {object} object
// @Failure 409 {object} object
// @Failure 500 {object} object
// @Router /horizontal-properties [post]
func (h *HorizontalPropertyHandler) CreateHorizontalProperty(c *gin.Context) {
	var req request.CreateHorizontalPropertyRequest

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
		h.logger.Error().Err(err).Msg("Error validating request")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "Errores de validación",
			Error:   err.Error(),
		})
		return
	}

	// Map request to domain DTO
	dto := mapper.MapCreateRequestToDTO(&req)

	// Call use case
	result, err := h.horizontalPropertyUseCase.CreateHorizontalProperty(c.Request.Context(), dto)
	if err != nil {
		h.logger.Error().Err(err).Msg("Error creating horizontal property")

		// Handle specific domain errors
		switch err.Error() {
		case "ya existe una propiedad horizontal con este código":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "El código de la propiedad horizontal ya existe",
				Error:   err.Error(),
			})
		case "tipo de negocio no encontrado":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "Tipo de negocio no válido",
				Error:   err.Error(),
			})
		case "el tipo de negocio debe ser de propiedad horizontal":
			c.JSON(http.StatusBadRequest, response.ErrorResponse{
				Success: false,
				Message: "El tipo de negocio debe ser de propiedad horizontal",
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
	c.JSON(http.StatusCreated, response.HorizontalPropertySuccessResponse{
		Success: true,
		Message: "Propiedad horizontal creada exitosamente",
		Data:    *responseData,
	})

	h.logger.Info().
		Uint("id", result.ID).
		Str("name", result.Name).
		Str("code", result.Code).
		Msg("Propiedad horizontal creada exitosamente")
}
