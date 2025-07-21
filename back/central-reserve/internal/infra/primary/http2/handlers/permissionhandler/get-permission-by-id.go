package permissionhandler

import (
	"central_reserve/internal/infra/primary/http2/handlers/permissionhandler/mapper"
	"central_reserve/internal/infra/primary/http2/handlers/permissionhandler/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetPermissionByIDHandler maneja la solicitud de obtener un permiso por ID
// @Summary Obtener permiso por ID
// @Description Obtiene un permiso específico por su ID
// @Tags Permissions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID del permiso" minimum(1)
// @Success 200 {object} response.PermissionSuccessResponse "Permiso obtenido exitosamente"
// @Failure 400 {object} response.PermissionErrorResponse "ID inválido"
// @Failure 401 {object} response.PermissionErrorResponse "Token de acceso requerido"
// @Failure 404 {object} response.PermissionErrorResponse "Permiso no encontrado"
// @Failure 500 {object} response.PermissionErrorResponse "Error interno del servidor"
// @Router /permissions/{id} [get]
func (h *PermissionHandler) GetPermissionByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.logger.Error().Str("id", idStr).Err(err).Msg("ID de permiso inválido")
		c.JSON(http.StatusBadRequest, response.PermissionErrorResponse{
			Error: "ID de permiso inválido",
		})
		return
	}

	h.logger.Info().Uint64("id", id).Msg("Iniciando solicitud para obtener permiso por ID")

	permission, err := h.usecase.GetPermissionByID(c.Request.Context(), uint(id))
	if err != nil {
		h.logger.Error().Uint64("id", id).Err(err).Msg("Error al obtener permiso por ID desde el caso de uso")

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

	permissionResponse := mapper.ToPermissionResponse(*permission)

	h.logger.Info().Uint64("id", id).Msg("Permiso obtenido exitosamente")
	c.JSON(http.StatusOK, response.PermissionSuccessResponse{
		Success: true,
		Data:    permissionResponse,
	})
}
