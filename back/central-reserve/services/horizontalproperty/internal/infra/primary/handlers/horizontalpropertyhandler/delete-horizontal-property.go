package horizontalpropertyhandler

import (
	"net/http"
	"strconv"

	"central_reserve/services/horizontalproperty/internal/infra/primary/handlers/horizontalpropertyhandler/response"

	"github.com/gin-gonic/gin"
)

// DeleteHorizontalProperty godoc
//
//	@Summary		Eliminar propiedad horizontal
//	@Description	Elimina una propiedad horizontal (soft delete) y sus imágenes de S3
//	@Tags			Propiedades Horizontales
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			hp_id	path		int	true	"ID de la propiedad horizontal"
//	@Success		200		{object}	response.HorizontalPropertyDeleteSuccessResponse
//	@Failure		400		{object}	object
//	@Failure		404		{object}	object
//	@Failure		409		{object}	object
//	@Failure		500		{object}	object
//	@Router			/horizontal-properties/{hp_id} [delete]
func (h *HorizontalPropertyHandler) DeleteHorizontalProperty(c *gin.Context) {
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

	// Call use case
	err = h.horizontalPropertyUseCase.DeleteHorizontalProperty(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.Error().Err(err).Uint("id", uint(id)).Msg("Error deleting horizontal property")

		// Handle specific domain errors
		switch err.Error() {
		case "propiedad horizontal no encontrada":
			c.JSON(http.StatusNotFound, response.ErrorResponse{
				Success: false,
				Message: "Propiedad horizontal no encontrada",
				Error:   err.Error(),
			})
		case "no se puede eliminar una propiedad horizontal que tiene unidades registradas":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "No se puede eliminar la propiedad horizontal",
				Error:   "La propiedad tiene unidades registradas",
			})
		case "no se puede eliminar una propiedad horizontal que tiene residentes registrados":
			c.JSON(http.StatusConflict, response.ErrorResponse{
				Success: false,
				Message: "No se puede eliminar la propiedad horizontal",
				Error:   "La propiedad tiene residentes registrados",
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

	// Return success response
	c.JSON(http.StatusOK, response.HorizontalPropertyDeleteSuccessResponse{
		Success: true,
		Message: "Propiedad horizontal eliminada exitosamente",
	})

	h.logger.Info().
		Uint("id", uint(id)).
		Msg("Propiedad horizontal eliminada exitosamente")
}
