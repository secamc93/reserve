package permissionhandler

import (
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeletePermissionHandler maneja la solicitud de eliminar un permiso
// @Summary Eliminar permiso
// @Description Elimina un permiso del sistema
// @Tags Permissions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del permiso" minimum(1)
// @Success 200 {object} response.PermissionMessageResponse "Permiso eliminado exitosamente"
// @Failure 400 {object} response.PermissionErrorResponse "ID inválido"
// @Failure 401 {object} response.PermissionErrorResponse "Token de acceso requerido"
// @Failure 404 {object} response.PermissionErrorResponse "Permiso no encontrado"
// @Failure 500 {object} response.PermissionErrorResponse "Error interno del servidor"
// @Router /permissions/{id} [delete]
func (h *PermissionHandler) DeletePermissionHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.logger.Error().Str("id", idStr).Err(err).Msg("ID de permiso inválido")
		c.JSON(http.StatusBadRequest, response.PermissionErrorResponse{
			Error: "ID de permiso inválido",
		})
		return
	}

	h.logger.Info().Uint64("id", id).Msg("Iniciando solicitud para eliminar permiso")

	result, err := h.usecase.DeletePermission(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.Error().Uint64("id", id).Err(err).Msg("Error al eliminar permiso desde el caso de uso")

		statusCode := http.StatusInternalServerError
		errorMessage := "Error interno del servidor"

		if err.Error() == "permiso no encontrado" {
			statusCode = http.StatusNotFound
			errorMessage = "Permiso no encontrado"
		}

		c.JSON(statusCode, response.PermissionErrorResponse{
			Error: errorMessage,
		})
		return
	}

	h.logger.Info().Uint64("id", id).Str("result", result).Msg("Permiso eliminado exitosamente")
	c.JSON(http.StatusOK, response.PermissionMessageResponse{
		Success: true,
		Message: result,
	})
}
