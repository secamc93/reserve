package resources

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/resources/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeleteResourceHandler elimina un recurso por su ID
// @Summary Eliminar recurso
// @Description Elimina un recurso del sistema por su ID único (eliminación suave)
// @Tags Resources
// @Accept json
// @Produce json
// @Param id path int true "ID del recurso" minimum(1)
// @Success 200 {object} map[string]interface{} "Recurso eliminado exitosamente"
// @Failure 400 {object} map[string]interface{} "ID de recurso inválido"
// @Failure 401 {object} map[string]interface{} "No autorizado"
// @Failure 404 {object} map[string]interface{} "Recurso no encontrado"
// @Failure 500 {object} map[string]interface{} "Error interno del servidor"
// @Router /resources/{id} [delete]
// @Security BearerAuth
func (h *ResourceHandler) DeleteResourceHandler(c *gin.Context) {
	// Obtener el ID del recurso de los parámetros de la URL
	resourceIDStr := c.Param("id")
	resourceID, err := strconv.ParseUint(resourceIDStr, 10, 32)
	if err != nil {
		h.logger.Error().Err(err).Str("resource_id", resourceIDStr).Msg("Error al parsear ID del recurso")
		c.JSON(http.StatusBadRequest, response.ErrorResponse{
			Success: false,
			Message: "ID de recurso inválido",
			Error:   "El ID del recurso debe ser un número válido",
		})
		return
	}

	h.logger.Info().Uint64("resource_id", resourceID).Msg("Iniciando eliminación de recurso")

	// Llamar al caso de uso
	message, err := h.usecase.DeleteResource(c.Request.Context(), uint(resourceID))
	if err != nil {
		h.logger.Error().Err(err).Uint64("resource_id", resourceID).Msg("Error al eliminar recurso")

		// Determinar el tipo de error y el código de estado HTTP
		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "recurso con ID "+resourceIDStr+" no encontrado" {
			statusCode = http.StatusNotFound
			errorMessage = "Recurso no encontrado"
		}

		c.JSON(statusCode, response.ErrorResponse{
			Success: false,
			Message: errorMessage,
			Error:   err.Error(),
		})
		return
	}

	h.logger.Info().
		Uint64("resource_id", resourceID).
		Str("message", message).
		Msg("Recurso eliminado exitosamente")

	c.JSON(http.StatusOK, response.DeleteResourceResponse{
		Success: true,
		Message: message,
	})
}
